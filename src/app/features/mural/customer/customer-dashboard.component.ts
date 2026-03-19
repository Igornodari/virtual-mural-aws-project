import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs';

import BaseComponent from 'src/app/components/base.component';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import {
  AppointmentApiService,
  CreateAppointmentPayload,
} from 'src/app/core/services/appointment-api.service';
import {
  ReviewApiService,
  AnonymousReviewDto,
  CreateReviewPayload,
} from 'src/app/core/services/review-api.service';

const CATEGORIES = [
  'Todas',
  'Beleza e Estética',
  'Manutenção e Reparos',
  'Alimentação',
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
  public reviewsMap: Record<string, AnonymousReviewDto[]> = {};
  public pendingRating: Record<string, number> = {};
  public pendingComment: Record<string, string> = {};
  public hoverRating: Record<string, number> = {};
  public selectedDayByService: Record<string, string | null> = {};

  public searchControl = new FormControl('');
  public selectedCategory = 'Todas';
  public expandedId: string | null = null;

  public isLoadingServices = false;
  public isScheduling: string | null = null;
  public isReviewing: string | null = null;
  public isLoadingReviews: string | null = null;

  public readonly categories = CATEGORIES;

  constructor(
    private onboardingService: OnboardingService,
    private serviceApi: ServiceApiService,
    private appointmentApi: AppointmentApiService,
    private reviewApi: ReviewApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.applyFilters();
    });

    this.loadServices();
  }

  get totalServices(): number {
    return this.services.length;
  }

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || 'Não definido';
  }

  get uniqueProviders(): number {
    return new Set(this.services.map(service => service.providerId)).size;
  }

  public loadServices(): void {
    this.isLoadingServices = true;

    this.serviceApi
      .findAll()
      .pipe(finalize(() => (this.isLoadingServices = false)))
      .subscribe({
        next: services => {
          this.services = services;
          this.applyFilters();
        },
      });
  }

  public applyFilters(): void {
    const search = (this.searchControl.value || '').toLowerCase().trim();

    this.filteredServices = this.services.filter(service => {
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

    if (!isOpening) return;

    this.serviceApi.trackMetric(service.id, 'clicks').subscribe();
    this.loadReviews(service.id);
  }

  public loadReviews(serviceId: string): void {
    if (this.reviewsMap[serviceId]) return;

    this.isLoadingReviews = serviceId;

    this.reviewApi
      .findByService(serviceId)
      .pipe(finalize(() => (this.isLoadingReviews = null)))
      .subscribe({
        next: reviews => {
          this.reviewsMap[serviceId] = reviews;
        },
      });
  }

  public selectDay(serviceId: string, day: string): void {
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
      `Olá! Vi seu serviço "${service.name}" no Mural do Condomínio e gostaria de mais informações.`,
    );

    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  }

  public onSchedule(service: ServiceDto): void {
    const day = this.getSelectedDay(service.id);
    if (!day) return;

    this.isScheduling = service.id;

    const payload: CreateAppointmentPayload = {
      serviceId: service.id,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledDay: day,
      notes: `Agendamento solicitado pelo mural para ${day}.`,
    };

    this.appointmentApi
      .create(payload)
      .pipe(finalize(() => (this.isScheduling = null)))
      .subscribe({
        next: () => {
          this.selectedDayByService[service.id] = null;
        },
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
      1: 'Péssimo',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente',
    };

    return labels[rating] || '';
  }

  public submitReview(service: ServiceDto): void {
    const rating = this.pendingRating[service.id];
    if (!rating) return;

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
        next: newReview => {
          this.pendingRating[service.id] = 0;
          this.pendingComment[service.id] = '';

          this.reviewsMap[service.id] = [newReview, ...(this.reviewsMap[service.id] || [])];

          this.refreshService(service.id);
        },
      });
  }

  public refreshService(serviceId: string): void {
    this.serviceApi.findOne(serviceId).subscribe({
      next: updatedService => {
        this.services = this.services.map(service =>
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
