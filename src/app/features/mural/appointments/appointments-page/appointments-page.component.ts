import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, filter, finalize, forkJoin, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import BaseComponent from 'src/app/components/base.component';
import { AppDialogConfirmationComponent } from 'src/app/components/dialog-confirmation.component';
import {
  PaymentMethod,
  PaymentMethodDialog,
} from 'src/app/components/payment-method-dialog/payment-method-dialog';
import { PixQrDialog } from 'src/app/components/pix-qr-dialog/pix-qr-dialog';

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

@Component({
  selector: 'app-mural-appointments-page',
  standalone: true,
  imports: [AppointmentPanelComponent],
  templateUrl: './appointments-page.component.html',
  styleUrls: ['./appointments-page.component.scss'],
})
export class MuralAppointmentsPageComponent extends BaseComponent implements OnInit {
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly onboardingService = inject(OnboardingService);

  readonly role = signal<AppointmentPanelRole>('customer');
  readonly appointments = signal<AppointmentDto[]>([]);
  readonly isLoading = signal(false);

  readonly viewMode = signal<AppointmentViewMode>('kanban');
  readonly updatingAppointmentId = signal<string | null>(null);
  readonly payingAppointmentId = signal<string | null>(null);
  readonly cancellingAppointmentId = signal<string | null>(null);

  ngOnInit(): void {
    this.role.set(this.onboardingService.profile.role === 'provider' ? 'provider' : 'customer');
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);

    if (this.role() === 'customer') {
      this.appointmentApi
        .findMine()
        .pipe(
          catchError(() => of([] as AppointmentDto[])),
          finalize(() => this.isLoading.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((appointments) => {
          this.appointments.set(this.sortAppointments(appointments));
        });

      return;
    }

    this.serviceApi
      .findMine()
      .pipe(
        switchMap((services) => {
          if (!services.length) {
            return of([] as AppointmentDto[]);
          }

          return forkJoin(services.map((service) => this.appointmentApi.findByService(service.id))).pipe(
            switchMap((result) => {
              const appointments = result
                .filter((item): item is AppointmentDto[] => Array.isArray(item))
                .flat();

              return of(appointments);
            }),
          );
        }),
        catchError(() => of([] as AppointmentDto[])),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((appointments) => {
        this.appointments.set(this.sortAppointments(appointments));
      });
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
    this.appointments.update((current) =>
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
