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

const CATEGORIES = [
  'Todas',
  'Beleza e Estetica',
  'Manutencao e Reparos',
  'Alimentacao',
  'Aulas e Tutoria',
  'Pets',
  'Limpeza',
  'Tecnologia',
  'Saúde e Bem-estar',
  'Outros',
];

@Component({
  selector: 'app-customer-dashboard',
  imports: [...importBase, MuralTopbarComponent],
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
    return this.allServices().length;
  }

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || 'Não definido';
  }

  constructor() {
    super({ loadUnit: false });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.serviceApi.findAll().subscribe({
      next: (list) => {
        this.allServices.set(list);
        this.isLoadingServices.set(false);
      },
      error: () => {
        this.isLoadingServices.set(false);
      },
    });
  }

  public selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  filterByCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  onContact(service: ServiceDto): void {
    this.contactWhatsApp(service);
  }

  /** Seleciona/deseleciona um dia para agendamento (chave = day + serviceId) */
  selectDay(key: string): void {
    this.selectedDay.set(this.selectedDay() === key ? null : key);
  }

  /** Confirma o agendamento do serviço com o dia selecionado */
  onSchedule(service: ServiceDto): void {
    const key = this.selectedDay();
    if (!key) return;
    // A chave é day + serviceId; extrai o dia removendo o serviceId do final
    const day = key.replace(service.id, '');
    this.scheduleService(service, day);
    this.selectedDay.set(null);
  }

  filterByDay(day: string): void {
    this.selectedDay.set(this.selectedDay() === day ? null : day);
  }

  public contactWhatsApp(service: ServiceDto): void {
    this.serviceApi.trackMetric(service.id, 'interests').subscribe();

    const phone = service.contact.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Vi seu serviço "${service.name}" no Mural do Condomínio e gostaria de mais informações.`,
    );
    const url = `https://wa.me/55${phone}?text=${message}`;
    window.open(url, '_blank');
  }

  scheduleService(service: ServiceDto, day: string): void {
    this.isScheduling.set(service.id);
    const today = new Date();
    const payload: CreateAppointmentPayload = {
      serviceId: service.id,
      scheduledDate: today.toISOString().split('T')[0],
      scheduledDay: day,
      notes: `Agendamento solicitado pelo mural para ${day}.`,
    };
    this.appointmentApi.create(payload).subscribe({
      next: () => {
        this.isScheduling.set(null);
        // Feedback visual — o snackbar global vai capturar se houver erro
      },
      error: () => {
        this.isScheduling.set(null);
      },
    });
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

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
