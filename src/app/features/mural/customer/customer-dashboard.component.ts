import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, filter, finalize, forkJoin, of, switchMap } from 'rxjs';
import BaseComponent from 'src/app/components/base.component';
import { AppDialogConfirmationComponent } from 'src/app/components/dialog-confirmation.component';
import {
  PaymentMethodDialog,
  PaymentMethod,
} from 'src/app/components/payment-method-dialog/payment-method-dialog';
import { PixQrDialog } from 'src/app/components/pix-qr-dialog/pix-qr-dialog';
import {
  AppointmentApiService,
  AppointmentDto,
  AppointmentPaymentDto,
} from 'src/app/core/services/appointment-api.service';
import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { AppUserProfileDto } from 'src/app/core/services/user-api.service';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { CustomerAppointmentsComponent } from './components/customer-appointments/customer-appointments.component';
import { CustomerFiltersComponent } from './components/customer-filters/customer-filters.component';
import { CustomerHeroComponent } from './components/customer-hero/customer-hero.component';
import {
  CustomerServiceDetailsDialog,
  CustomerServiceDetailsDialogData,
  CustomerServiceDetailsDialogResult,
} from './components/customer-service-details/customer-service-details-dialog.component';
import { CUSTOMER_ALL_CATEGORY, CUSTOMER_CATEGORIES } from './customer.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-customer-dashboard',
  imports: [
    ...importBase,
    ServiceCardComponent,
    CustomerAppointmentsComponent,
    CustomerFiltersComponent,
    CustomerHeroComponent,
    EmptyStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
})
export class CustomerDashboardComponent extends BaseComponent implements OnInit {
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(SnackBarService);
  private readonly cdr = inject(ChangeDetectorRef);

  public services: ServiceDto[] = [];
  public visibleServices: ServiceDto[] = [];
  public appointments: AppointmentDto[] = [];

  public searchTerm = '';
  public selectedCategory = CUSTOMER_ALL_CATEGORY;

  public isLoadingDashboard = true;
  public isPayingAppointment: string | null = null;
  public isCancellingAppointment: string | null = null;

  public totalServices = 0;
  public uniqueProviders = 0;
  public condoCity = 'Nao definido';

  public readonly categories = CUSTOMER_CATEGORIES;

  // Strip diacritics regex (U+0300..U+036F). Constructed via String.fromCharCode
  // to avoid encoding issues at write time.
  private static readonly DIACRITICS_RE = new RegExp(
    '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
    'g',
  );

  constructor() {
    super();
  }

  ngOnInit(): void {
    const checkoutSessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (checkoutSessionId) {
      this.verifyPaymentAndLoadDashboard(checkoutSessionId);
      return;
    }

    this.loadDashboard();
  }


  private runAfterCurrentChangeDetection(callback: () => void): void {
    setTimeout(() => {
      callback();
      this.cdr.detectChanges();
    }, 0);
  }


  private verifyPaymentAndLoadDashboard(checkoutSessionId: string): void {
    this.isLoadingDashboard = true;

    this.appointmentApi
      .verifyPaymentSession(checkoutSessionId)
      .pipe(
        catchError((error) => {
          console.error('Erro ao verificar pagamento:', error);
          return of(null);
        }),
        finalize(() => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              payment: null,
              session_id: null,
            },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });

          this.loadDashboard();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private loadDashboard(): void {
    this.isLoadingDashboard = true;

    forkJoin({
      profile: this.userApi.getMe().pipe(catchError(() => of(null as AppUserProfileDto | null))),
      services: this.serviceApi.findAll().pipe(catchError(() => of([] as ServiceDto[]))),
      appointments: this.appointmentApi.findMine().pipe(catchError(() => of([] as AppointmentDto[]))),
    })
      .pipe(
        finalize(() => {
          this.isLoadingDashboard = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ profile, services, appointments }) => {
        this.condoCity =
          profile?.condominium?.name ||
          'Nao definido';

        this.services = Array.isArray(services) ? services : [];
        this.appointments = this.sortAppointments(appointments);
        this.syncServiceView();
      });
  }

  private syncServiceView(): void {
    const search = this.normalize(this.searchTerm);
    const category = this.selectedCategory || CUSTOMER_ALL_CATEGORY;

    this.totalServices = this.services.length;
    this.uniqueProviders = new Set(this.services.map((service) => service.providerId)).size;

    this.visibleServices = this.services.filter((service) => {
      const matchesCategory = category === CUSTOMER_ALL_CATEGORY || service.category === category;

      const matchesSearch =
        !search ||
        this.normalize(service.name).includes(search) ||
        this.normalize(service.description).includes(search) ||
        this.normalize(service.category).includes(search);

      return matchesCategory && matchesSearch;
    });
  }

  private normalize(value: string | null | undefined): string {
    // NFD + strip diacritics: faz "Manutencao" virar "manutencao",
    // assim o usuario pode buscar sem acento e ainda achar.
    return (value ?? '')
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(CustomerDashboardComponent.DIACRITICS_RE, '')
      .trim();
  }

  private sortAppointments(appointments: AppointmentDto[] | null | undefined): AppointmentDto[] {
    const list = Array.isArray(appointments) ? appointments : [];
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.syncServiceView();
  }

  public selectCategory(category: string): void {
    this.selectedCategory = category;
    this.syncServiceView();
  }

  /**
   * Abre o detalhe do servico (calendario + reviews + agendar) em um
   * modal Material. Antes era um card empilhado abaixo do service-card
   * dentro do mesmo grid, o que quebrava o layout.
   */
  public openServiceDetails(service: ServiceDto): void {
    const dialogRef = this.dialog.open<
      CustomerServiceDetailsDialog,
      CustomerServiceDetailsDialogData,
      CustomerServiceDetailsDialogResult | undefined
    >(CustomerServiceDetailsDialog, {
      data: { service },
      width: '720px',
      maxWidth: '100vw',
      panelClass: 'responsive-dialog',
      autoFocus: false,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }

        if (result.type === 'appointmentCreated') {
          this.addAppointment(result.appointment);

          if (result.service) {
            this.replaceService(result.service);
          }

          this.snackBar.success('Agendamento solicitado com sucesso.');
          return;
        }

        if (result.type === 'serviceUpdated') {
          this.replaceService(result.service);
        }
      });
  }

  public contactWhatsApp(service: ServiceDto): void {
    this.serviceApi
      .trackMetric(service.id, 'interests')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    const phone = service.contact.replace(/\D/g, '');
    const message = encodeURIComponent(
      'Ola! Vi seu servico "' + service.name + '" no mural do condominio e gostaria de mais informacoes.',
    );

    window.open('https://wa.me/55' + phone + '?text=' + message, '_blank');
  }

  public addAppointment(appointment: AppointmentDto): void {
    const alreadyExists = this.appointments.some(
      (item) => item.id === appointment.id,
    );

    if (alreadyExists) {
      this.replaceAppointment(appointment);
      return;
    }

    this.appointments = this.sortAppointments([
      appointment,
      ...this.appointments,
    ]);
  }
  public payAppointment(appointment: AppointmentDto): void {
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

        this.isPayingAppointment = appointment.id;

        this.appointmentApi
          .createPayment(appointment.id, { method: selectedMethod })
          .pipe(
            finalize(() => {
              this.isPayingAppointment = null;
            }),
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

  /**
   * Cancela o agendamento como morador. Permitido apenas enquanto o
   * pagamento ainda nao foi efetivado (status pending / confirmed /
   * awaiting_payment). Pede confirmacao antes de chamar a API porque
   * eh acao destrutiva, e mostra snackbar com erro vindo do backend
   * caso o status ja tenha avancado para paid.
   */
  public cancelAppointment(appointment: AppointmentDto): void {
    const confirmRef = this.dialog.open(AppDialogConfirmationComponent, {
      data: {
        title: 'Cancelar agendamento',
        subTitle:
          'Tem certeza que deseja cancelar este agendamento? Essa acao nao pode ser desfeita.',
      },
      width: '420px',
      maxWidth: '100vw',
      panelClass: 'responsive-dialog',
    });

    confirmRef
      .afterClosed()
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() => {
          this.isCancellingAppointment = appointment.id;
          return this.appointmentApi.cancelByCustomer(appointment.id).pipe(
            catchError((error: { message?: string }) => {
              const message =
                error?.message ??
                'Nao foi possivel cancelar este agendamento.';
              this.snackBar.error(message);
              return of(null);
            }),
            finalize(() => {
              this.isCancellingAppointment = null;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((updated) => {
        if (updated) {
          this.replaceAppointment(updated);
          this.snackBar.success('Agendamento cancelado.');
        }
      });
  }

  public replaceService(updatedService: ServiceDto): void {
    this.services = this.services.map((service) =>
      service.id === updatedService.id ? updatedService : service,
    );

    this.syncServiceView();
  }

  private replaceAppointment(updated: AppointmentDto): void {
    this.appointments = this.appointments.map((appointment) =>
      appointment.id === updated.id ? updated : appointment,
    );
  }
}
