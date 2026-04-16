import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize, takeUntil } from 'rxjs';

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
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import { ChatDialogComponent } from 'src/app/shared/components/chat-dialog/chat-dialog.component';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { CustomerAppointmentsComponent } from './components/customer-appointments/customer-appointments.component';
import { CustomerFiltersComponent } from './components/customer-filters/customer-filters.component';
import { CustomerHeroComponent } from './components/customer-hero/customer-hero.component';
import { CustomerServiceDetailsComponent } from './components/customer-service-details/customer-service-details.component';
import { CUSTOMER_ALL_CATEGORY, CUSTOMER_CATEGORIES } from './customer.constants';
import { CustomerServiceFilterPipe } from './pipes/customer-service-filter.pipe';

@Component({
  selector: 'app-customer-dashboard',
  imports: [
    ...importBase,
    ServiceCardComponent,
    CustomerAppointmentsComponent,
    CustomerFiltersComponent,
    CustomerHeroComponent,
    CustomerServiceDetailsComponent,
    CustomerServiceFilterPipe,
    EmptyStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
})
export class CustomerDashboardComponent extends BaseComponent implements OnInit {
  private readonly onboardingService = inject(OnboardingService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly dialog = inject(MatDialog);

  public services: ServiceDto[] = [];
  public appointments: AppointmentDto[] = [];

  public searchTerm = '';
  public selectedCategory = CUSTOMER_ALL_CATEGORY;
  public expandedId: string | null = null;

  public isLoadingServices = false;
  public isLoadingAppointments = false;
  public isPayingAppointment: string | null = null;

  public totalServices = 0;
  public uniqueProviders = 0;
  public condoCity = 'Nao definido';

  public readonly categories = CUSTOMER_CATEGORIES;
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.condoCity = this.onboardingService.profile.condominiumAddress?.city || 'Nao definido';
    this.loadServices();
    this.loadMyAppointments();
  }

  public loadServices(): void {
    this.isLoadingServices = true;

    this.serviceApi
      .findAll()
      .pipe(
        finalize(() => (this.isLoadingServices = false)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe({
        next: (services) => {
          this.services = Array.isArray(services) ? services : [];
          this.updateStats();
        },
        error: () => {
          this.services = [];
          this.totalServices = 0;
          this.uniqueProviders = 0;
        },
      });
  }

  public loadMyAppointments(): void {
    this.isLoadingAppointments = true;

    this.appointmentApi
      .findMine()
      .pipe(
        finalize(() => (this.isLoadingAppointments = false)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe({
        next: (appointments) => {
          const appointmentsArray = Array.isArray(appointments) ? appointments : [];
          this.appointments = appointmentsArray.sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          );
        },
        error: () => {
          this.appointments = [];
        },
      });
  }

  public onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
  }

  public selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  public toggleExpand(service: ServiceDto): void {
    this.expandedId = this.expandedId === service.id ? null : service.id;
  }

  public contactWhatsApp(service: ServiceDto): void {
    this.serviceApi
      .trackMetric(service.id, 'interests')
      .pipe(takeUntil(this.unsubscribe$))
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
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((selectedMethod: PaymentMethod) => {
        if (!selectedMethod) {
          return;
        }

        this.isPayingAppointment = appointment.id;

        this.appointmentApi
          .createPayment(appointment.id, { method: selectedMethod })
          .pipe(
            finalize(() => (this.isPayingAppointment = null)),
            takeUntil(this.unsubscribe$),
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

  public openChat(appointment: AppointmentDto): void {
    this.dialog.open(ChatDialogComponent, {
      data: {
        appointmentId: appointment.id,
        recipientName: appointment.service?.provider?.displayName || 'Prestador',
      },
      width: '450px',
      maxWidth: '95vw',
    });
  }

  public replaceService(updatedService: ServiceDto): void {
    this.services = this.services.map((service) =>
      service.id === updatedService.id ? updatedService : service,
    );
    this.updateStats();
  }

  private updateStats(): void {
    this.totalServices = this.services.length;
    this.uniqueProviders = new Set(this.services.map((service) => service.providerId)).size;
  }

  private replaceAppointment(updated: AppointmentDto): void {
    this.appointments = this.appointments.map((appointment) =>
      appointment.id === updated.id ? updated : appointment,
    );
  }
}
