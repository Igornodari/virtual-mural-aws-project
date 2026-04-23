import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import BaseComponent from 'src/app/components/base.component';
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
import { AppUserProfileDto } from 'src/app/core/services/user-api.service';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { CustomerAppointmentsComponent } from './components/customer-appointments/customer-appointments.component';
import { CustomerFiltersComponent } from './components/customer-filters/customer-filters.component';
import { CustomerHeroComponent } from './components/customer-hero/customer-hero.component';
import { CustomerServiceDetailsComponent } from './components/customer-service-details/customer-service-details.component';
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
    CustomerServiceDetailsComponent,
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

  public services: ServiceDto[] = [];
  public visibleServices: ServiceDto[] = [];
  public appointments: AppointmentDto[] = [];

  public searchTerm = '';
  public selectedCategory = CUSTOMER_ALL_CATEGORY;
  public expandedId: string | null = null;

  public isLoadingDashboard = true;
  public isPayingAppointment: string | null = null;

  public totalServices = 0;
  public uniqueProviders = 0;
  public condoCity = 'Nao definido';

  public readonly categories = CUSTOMER_CATEGORIES;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadDashboard();
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
    return (value ?? '').toLocaleLowerCase().trim();
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

  public toggleExpand(service: ServiceDto): void {
    this.expandedId = this.expandedId === service.id ? null : service.id;
  }

  public contactWhatsApp(service: ServiceDto): void {
    this.serviceApi
      .trackMetric(service.id, 'interests')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    const phone = service.contact.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Ola! Vi seu servico "${service.name}" no mural do condominio e gostaria de mais informacoes.`,
    );

    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  }

  public addAppointment(appointment: AppointmentDto): void {
    this.appointments = [appointment, ...this.appointments];
  }

  public payAppointment(appointment: AppointmentDto): void {
    const dialogRef = this.dialog.open(PaymentMethodDialog, {
      data: { appointmentId: appointment.id },
      width: '400px',
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
                  width: '400px',
                });
              }
            },
          });
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
