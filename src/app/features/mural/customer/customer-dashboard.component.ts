import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { finalize, takeUntil } from 'rxjs';

import BaseComponent from 'src/app/components/base.component';
import { PaymentMethodDialog, PaymentMethod } from 'src/app/components/payment-method-dialog/payment-method-dialog';
import { PixQrDialog } from 'src/app/components/pix-qr-dialog/pix-qr-dialog';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';
import { AppointmentApiService, AppointmentDto, AppointmentPaymentDto, AppointmentStatus, CreateAppointmentPayload } from 'src/app/core/services/appointment-api.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { ReviewApiService, AnonymousReviewDto, CreateReviewPayload } from 'src/app/core/services/review-api.service';
import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

const CATEGORIES = [
  'Todas',
  'Beleza e Estetica',
  'Manutencao e Reparos',
  'Alimentacao',
  'Aulas e Tutoria',
  'Pets',
  'Limpeza',
  'Tecnologia',
  'Saude e Bem-estar',
  'Outros',
];

const BLOCKING_STATUSES: AppointmentStatus[] = ['confirmed', 'awaiting_payment', 'paid', 'completed'];

@Component({
  selector: 'app-customer-dashboard',
  imports: [...importBase],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
})
export class CustomerDashboardComponent extends BaseComponent implements OnInit {
  public services: ServiceDto[] = [];
  public filteredServices: ServiceDto[] = [];
  public appointments: AppointmentDto[] = [];
  public reviewsMap: Record<string, AnonymousReviewDto[]> = {};
  public blockedDaysByService: Record<string, string[]> = {};
  public pendingRating: Record<string, number> = {};
  public pendingComment: Record<string, string> = {};
  public hoverRating: Record<string, number> = {};
  public selectedDayByService: Record<string, string | null> = {};

  public searchControl = new FormControl('');
  public selectedCategory = 'Todas';
  public expandedId: string | null = null;

  public isLoadingServices = false;
  public isLoadingAppointments = false;
  public isScheduling: string | null = null;
  public isReviewing: string | null = null;
  public isLoadingReviews: string | null = null;
  public isPayingAppointment: string | null = null;

  public readonly categories = CATEGORIES;

  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly serviceApi: ServiceApiService,
    private readonly appointmentApi: AppointmentApiService,
    private readonly reviewApi: ReviewApiService,
    private readonly dialog: MatDialog,
    private readonly snackBar: SnackBarService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.applyFilters();
    });

    this.loadServices();
    this.loadMyAppointments();
  }

  get totalServices(): number {
    return this.services.length;
  }

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || 'Nao definido';
  }

  get uniqueProviders(): number {
    return new Set(this.services.map((service) => service.providerId)).size;
  }

  public loadServices(): void {
    this.isLoadingServices = true;

    this.serviceApi
      .findAll()
      .pipe(finalize(() => (this.isLoadingServices = false)))
      .subscribe({
        next: (services) => {
          this.services = services;
          this.applyFilters();
        },
      });
  }

  public loadMyAppointments(): void {
    this.isLoadingAppointments = true;

    this.appointmentApi
      .findMine()
      .pipe(finalize(() => (this.isLoadingAppointments = false)))
      .subscribe({
        next: (appointments) => {
          const appointmentsArray = Array.isArray(appointments) ? appointments : [];
          this.appointments = appointmentsArray.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        },
        error: (err) => {
          console.error('Erro ao carregar appointments:', err);
          this.appointments = [];
        },
      });
  }

  public applyFilters(): void {
    const search = (this.searchControl.value || '').toLowerCase().trim();

    this.filteredServices = this.services.filter((service) => {
      const matchesCategory =
        this.selectedCategory === 'Todas' || service.category === this.selectedCategory;

      const matchesSearch =
        !search ||
        service.name.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }

  public selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  public toggleExpand(service: ServiceDto): void {
    const isOpening = this.expandedId !== service.id;
    this.expandedId = isOpening ? service.id : null;

    if (!isOpening) {
      return;
    }

    this.serviceApi.trackMetric(service.id, 'clicks').subscribe();
    this.loadReviews(service.id);
    this.loadServiceAvailability(service.id);
  }

  public loadReviews(serviceId: string): void {
    if (this.reviewsMap[serviceId]) {
      return;
    }

    this.isLoadingReviews = serviceId;

    this.reviewApi
      .findByService(serviceId)
      .pipe(finalize(() => (this.isLoadingReviews = null)))
      .subscribe({
        next: (reviews) => {
          this.reviewsMap[serviceId] = reviews;
        },
      });
  }

  public loadServiceAvailability(serviceId: string): void {
    this.appointmentApi.findByService(serviceId).subscribe({
      next: (appointments) => {
        const appointmentsArray = Array.isArray(appointments) ? appointments : [];
        this.blockedDaysByService[serviceId] = appointmentsArray
          .filter((appointment) => BLOCKING_STATUSES.includes(appointment.status))
          .map((appointment) => appointment.scheduledDay);
      },
      error: (err) => {
        console.error('Erro ao carregar disponibilidade:', err);
        this.blockedDaysByService[serviceId] = [];
      },
    });
  }

  public isDayUnavailable(serviceId: string, day: string): boolean {
    return (this.blockedDaysByService[serviceId] || []).includes(day);
  }

  public selectDay(serviceId: string, day: string): void {
    if (this.isDayUnavailable(serviceId, day)) {
      return;
    }

    this.selectedDayByService[serviceId] =
      this.selectedDayByService[serviceId] === day ? null : day;
  }

  public getSelectedDay(serviceId: string): string | null {
    return this.selectedDayByService[serviceId] || null;
  }

  public contactWhatsApp(service: ServiceDto): void {
    this.serviceApi.trackMetric(service.id, 'interests').subscribe();

    const phone = service.contact.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Ola! Vi seu servico "${service.name}" no mural do condominio e gostaria de mais informacoes.`,
    );

    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  }

  public onSchedule(service: ServiceDto): void {
    const day = this.getSelectedDay(service.id);
    if (!day || this.isDayUnavailable(service.id, day)) {
      return;
    }

    this.isScheduling = service.id;

    const payload: CreateAppointmentPayload = {
      serviceId: service.id,
      scheduledDate: this.resolveNextDateForDay(day),
      scheduledDay: day,
      notes: `Agendamento solicitado pelo mural para ${day}.`,
    };

    this.appointmentApi
      .create(payload)
      .pipe(finalize(() => (this.isScheduling = null)))
      .subscribe({
        next: (appointment) => {
          this.selectedDayByService[service.id] = null;
          this.appointments = [appointment, ...this.appointments];
        },
      });
  }

 public payAppointment(appointment: AppointmentDto): void {
  const dialogRef = this.dialog.open(PaymentMethodDialog, {
    data: { appointmentId: appointment.id },
    width: '400px',
  });

  dialogRef.afterClosed().subscribe((selectedMethod: PaymentMethod) => {
    if (!selectedMethod) return;

    this.isPayingAppointment = appointment.id;

    this.appointmentApi
      .createPayment(appointment.id, { method: selectedMethod })
      .pipe(finalize(() => (this.isPayingAppointment = null)))
      .subscribe({
        next: (paymentSession: AppointmentPaymentDto) => {
          this.replaceAppointment(paymentSession.appointment);
          if (selectedMethod === 'credit_card' && paymentSession.checkoutUrl) {
            window.location.href = paymentSession.checkoutUrl;
            return;
          }

          if (selectedMethod === 'pix' && (paymentSession.qrCode || paymentSession.qrCodeText)) {
            this.dialog.open(PixQrDialog, {
              data: {
                qrCode: paymentSession.qrCode,
                qrCodeText: paymentSession.qrCodeText,
              },
              width: '400px',
            });
          }

          this.loadServiceAvailability(appointment.serviceId);
        },
      });
  });
}
  public hoverStar(serviceId: string, star: number): void {
    this.hoverRating[serviceId] = star;
  }

  public setRating(serviceId: string, star: number): void {
    this.pendingRating[serviceId] = star;
  }

  public setComment(serviceId: string, comment: string): void {
    this.pendingComment[serviceId] = comment;
  }

  public getRatingLabel(rating: number): string {
    const labels: Record<number, string> = {
      1: 'Pessimo',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente',
    };

    return labels[rating] || '';
  }

  public getAppointmentStatusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      pending: 'Solicitado',
      confirmed: 'Confirmado',
      awaiting_payment: 'Aguardando pagamento',
      paid: 'Pago',
      cancelled: 'Cancelado',
      completed: 'Concluido',
    };

    return labels[status];
  }

  public canPayAppointment(appointment: AppointmentDto): boolean {
    return appointment.status === 'confirmed' || appointment.status === 'awaiting_payment';
  }

  public submitReview(service: ServiceDto): void {
    const rating = this.pendingRating[service.id];
    if (!rating) {
      return;
    }

    this.isReviewing = service.id;

    const payload: CreateReviewPayload = {
      serviceId: service.id,
      rating,
      comment: this.pendingComment[service.id] || undefined,
    };

    this.reviewApi
      .create(payload)
      .pipe(finalize(() => (this.isReviewing = null)))
      .subscribe({
        next: (newReview) => {
          this.pendingRating[service.id] = 0;
          this.pendingComment[service.id] = '';
          this.reviewsMap[service.id] = [newReview, ...(this.reviewsMap[service.id] || [])];
          this.refreshService(service.id);
        },
      });
  }

  public refreshService(serviceId: string): void {
    this.serviceApi.findOne(serviceId).subscribe({
      next: (updatedService) => {
        this.services = this.services.map((service) =>
          service.id === updatedService.id ? updatedService : service,
        );
        this.applyFilters();
      },
    });
  }

  private replaceAppointment(updated: AppointmentDto): void {
    this.appointments = this.appointments.map((appointment) =>
      appointment.id === updated.id ? updated : appointment,
    );
  }

  private resolveNextDateForDay(day: string): string {
    const dayMap: Record<string, number> = {
      Domingo: 0,
      'Segunda-feira': 1,
      Segunda: 1,
      Terca: 2,
      'Terça-feira': 2,
      Quarta: 3,
      'Quarta-feira': 3,
      Quinta: 4,
      'Quinta-feira': 4,
      Sexta: 5,
      'Sexta-feira': 5,
      Sabado: 6,
      Sábado: 6,
    };

    const targetDay = dayMap[day] ?? new Date().getDay();
    const currentDate = new Date();
    const diff = (targetDay - currentDate.getDay() + 7) % 7 || 7;

    currentDate.setDate(currentDate.getDate() + diff);
    return currentDate.toISOString().split('T')[0];
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo(ROUTE_PATHS.login);
  }
}
