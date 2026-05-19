import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { catchError, filter, finalize, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import BaseComponent from 'src/app/shared/components/base-component/base.component';
import { AppDialogConfirmationComponent } from 'src/app/shared/components/dialog-confirmation/dialog-confirmation.component';
import {
  PaymentMethod,
  PaymentMethodDialog,
} from 'src/app/shared/components/payment-method-dialog/payment-method-dialog';
import { PixQrDialog } from 'src/app/shared/components/pix-qr-dialog/pix-qr-dialog';

import {
  AppointmentApiService,
  AppointmentDto,
  AppointmentPaymentDto,
  AppointmentStatus,
} from 'src/app/core/services/appointment-api.service';

import { OnboardingService } from 'src/app/core/services/onboarding.service';

import {
  AppointmentPanelComponent,
  AppointmentPanelRole,
  AppointmentViewMode,
} from 'src/app/shared/components/appointments/appointment-panel/appointment-panel.component';

import { importBase } from 'src/app/shared/constant/import-base.constant';

/**
 * Aba ativa no painel de agendamentos. Quando o usuário é prestador, ele
 * pode alternar entre os agendamentos que solicitou (como morador) e os
 * que recebeu (como prestador). Para quem ainda não é prestador, só
 * existe a aba "asCustomer".
 */
type AppointmentsTab = 'asCustomer' | 'asProvider';

@Component({
  selector: 'app-mural-appointments-page',
  standalone: true,
  imports: [importBase, AppointmentPanelComponent],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss'],
})
export class MuralAppointmentsPageComponent extends BaseComponent implements OnInit {
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly onboardingService = inject(OnboardingService);

  /** Indica se o usuário ativou o modo prestador (libera a 2a aba). */
  readonly isProvider = signal(false);

  /** Aba ativa. */
  readonly activeTab = signal<AppointmentsTab>('asCustomer');

  /** Lista completa retornada pelo backend (cliente + prestador unificados). */
  readonly allAppointments = signal<AppointmentDto[]>([]);

  /**
   * Id do usuário no banco (NÃO confundir com `this.user.id`, que é o
   * Cognito sub). Obtido via `userApi.getMe()` ao montar a página.
   * É esse id que coincide com `appointment.customerId` e
   * `service.providerId` retornados pela API. Sem ele a classificação
   * em "Como morador" / "Como prestador" não funciona corretamente.
   */
  readonly dbUserId = signal<string | null>(null);

  readonly isLoading = signal(false);
  readonly viewMode = signal<AppointmentViewMode>('kanban');
  readonly updatingAppointmentId = signal<string | null>(null);
  readonly payingAppointmentId = signal<string | null>(null);
  readonly cancellingAppointmentId = signal<string | null>(null);

  /**
   * Classifica um agendamento como 'customer' (eu solicitei) ou
   * 'provider' (sou dono do serviço) comparando IDs do banco. Priorizamos
   * o `viewerRole` quando o backend o enviar; senão fazemos a derivação
   * local. Isso torna o componente resiliente a respostas legadas e a
   * problemas de serialização do backend.
   */
  private classifyAppointment(
    appointment: AppointmentDto,
  ): 'customer' | 'provider' | 'unknown' {
    if (appointment.viewerRole) {
      return appointment.viewerRole;
    }
    const me = this.dbUserId();
    if (!me) {
      return 'unknown';
    }
    if (appointment.customerId === me) {
      return 'customer';
    }
    const providerId =
      appointment.service?.providerId ?? appointment.service?.provider?.id;
    if (providerId && providerId === me) {
      return 'provider';
    }
    return 'unknown';
  }

  /**
   * Agendamentos onde o usuário atual é o cliente que solicitou.
   */
  readonly customerAppointments = computed(() =>
    this.allAppointments().filter(
      (a) => this.classifyAppointment(a) === 'customer',
    ),
  );

  /**
   * Agendamentos onde o usuário atual é o prestador que recebeu a
   * solicitação. Só faz sentido quando isProvider === true.
   */
  readonly providerAppointments = computed(() =>
    this.allAppointments().filter(
      (a) => this.classifyAppointment(a) === 'provider',
    ),
  );

  /** Role passada ao AppointmentPanel baseada na aba ativa. */
  readonly currentPanelRole = computed<AppointmentPanelRole>(() =>
    this.activeTab() === 'asProvider' ? 'provider' : 'customer',
  );

  readonly currentAppointments = computed(() =>
    this.activeTab() === 'asProvider'
      ? this.providerAppointments()
      : this.customerAppointments(),
  );

  ngOnInit(): void {
    this.isProvider.set(this.onboardingService.isProvider);
    this.loadCurrentDbUserId();
    this.loadAppointments();
  }

  /**
   * Carrega o id do usuário no banco. Sem ele os filtros caem para
   * 'unknown' e tudo aparece vazio, então tratamos como pré-requisito
   * da página. Roda em paralelo com `loadAppointments` — quando ambos
   * resolverem, os `computed` recalculam automaticamente porque
   * dependem de `dbUserId` e `allAppointments`.
   */
  private loadCurrentDbUserId(): void {
    this.userApi
      .getMe()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((me) => {
        this.dbUserId.set(me?.id ?? null);
      });
  }

  loadAppointments(): void {
    this.isLoading.set(true);

    this.appointmentApi
      .findMine()
      .pipe(
        catchError(() => of([] as AppointmentDto[])),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((appointments) => {
        const list = Array.isArray(appointments) ? appointments : [];
        this.allAppointments.set(this.sortAppointments(list));
      });
  }

  setActiveTab(tab: AppointmentsTab): void {
    this.activeTab.set(tab);
  }

  onPayAppointment(appointment: AppointmentDto): void {
    const dialogRef = this.dialog.open(PaymentMethodDialog, {
      data: { appointmentId: appointment.id },
      width: '440px',
      maxWidth: '100vw',
      panelClass: 'responsive-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedMethod: PaymentMethod) => {
        if (!selectedMethod) {
          return;
        }

        this.payingAppointmentId.set(appointment.id);

        this.appointmentApi
          .createPayment(appointment.id, { method: selectedMethod })
          .pipe(
            finalize(() => this.payingAppointmentId.set(null)),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe({
            next: (paymentSession: AppointmentPaymentDto) => {
              this.replaceAppointment(paymentSession.appointment);

              if (selectedMethod === 'credit_card' && paymentSession.checkoutUrl) {
                window.location.href = paymentSession.checkoutUrl;
                return;
              }

              if (
                selectedMethod === 'pix' &&
                (paymentSession.qrCode || paymentSession.qrCodeText)
              ) {
                this.dialog.open(PixQrDialog, {
                  data: {
                    qrCode: paymentSession.qrCode,
                    qrCodeText: paymentSession.qrCodeText,
                  },
                  width: '440px',
                  maxWidth: '100vw',
                  panelClass: 'responsive-dialog',
                });
              }
            },
          });
      });
  }

  onCancelAsCustomer(appointment: AppointmentDto): void {
    const confirmRef = this.dialog.open(AppDialogConfirmationComponent, {
      data: {
        title: 'Cancelar agendamento',
        subTitle: 'Tem certeza que deseja cancelar este agendamento? Essa ação não pode ser desfeita.',
      },
      width: '420px',
      maxWidth: '100vw',
      panelClass: 'responsive-dialog',
    });

    confirmRef
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.cancellingAppointmentId.set(appointment.id);

          return this.appointmentApi.cancelByCustomer(appointment.id).pipe(
            catchError((error: { message?: string }) => {
              this.snackBar.error(error?.message ?? 'Não foi possível cancelar este agendamento.');
              return of(null);
            }),
            finalize(() => this.cancellingAppointmentId.set(null)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((updated) => {
        if (!updated) {
          return;
        }

        this.replaceAppointment(updated);
        this.snackBar.success('Agendamento cancelado.');
      });
  }

  onProviderStatusChange(event: {
    appointment: AppointmentDto;
    status: AppointmentStatus;
  }): void {
    this.updatingAppointmentId.set(event.appointment.id);

    this.appointmentApi
      .updateStatus(event.appointment.id, event.status)
      .pipe(
        finalize(() => this.updatingAppointmentId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((updated) => {
        this.replaceAppointment(updated);
      });
  }

  private replaceAppointment(updated: AppointmentDto): void {
    this.allAppointments.update((current) =>
      this.sortAppointments(
        current.map((appointment) =>
          appointment.id === updated.id ? updated : appointment,
        ),
      ),
    );
  }

  private sortAppointments(appointments: AppointmentDto[]): AppointmentDto[] {
    return [...appointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
