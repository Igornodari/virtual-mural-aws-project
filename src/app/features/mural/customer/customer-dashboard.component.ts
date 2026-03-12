import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import BaseComponent from '../../../components/base.component';
import { MuralTopbarComponent } from '../../../components/mural-topbar/mural-topbar.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { ServiceApiService, ServiceDto } from '../../../core/services/service-api.service';
import { AppointmentApiService, CreateAppointmentPayload } from '../../../core/services/appointment-api.service';
import { ReviewApiService, CreateReviewPayload } from '../../../core/services/review-api.service';
import { TranslateModule } from '@ngx-translate/core';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const CATEGORIES = [
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
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslateModule,
    MuralTopbarComponent,
  ],
  template: `
    <div class="customer-layout">
      <app-mural-topbar
        role="customer"
        [userName]="user?.givenName || user?.displayName || ''"
        (logout)="onLogout()"
      />

      <main class="customer-main">
        <!-- Hero -->
        <section class="hero-section">
          <div>
            <h1 class="hero-title">{{ 'APP.CUSTOMER.HERO_TITLE' | translate }}</h1>
            <p class="text-muted">
              {{ 'APP.CUSTOMER.HERO_SUBTITLE' | translate }}
              <strong>{{ condoCity }}</strong>.
            </p>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-value">{{ totalServices }}</span>
              <span class="text-muted">{{ 'APP.CUSTOMER.STATS_SERVICES' | translate }}</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-value">{{ uniqueProviders() }}</span>
              <span class="text-muted">{{ 'APP.CUSTOMER.STATS_PROVIDERS' | translate }}</span>
            </div>
          </div>
        </section>

        <!-- Filtros -->
        <section class="filters-section">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>{{ 'APP.CUSTOMER.SEARCH_PLACEHOLDER' | translate }}</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [formControl]="searchControl" />
          </mat-form-field>
          <div class="category-chips">
            <button class="cat-chip" [class.cat-chip--active]="selectedCategory() === 'Todas'"
              (click)="selectCategory('')">
              {{ 'APP.CUSTOMER.FILTER_ALL' | translate }}
            </button>
            @for (cat of categories; track cat) {
              <button class="cat-chip" [class.cat-chip--active]="selectedCategory() === cat"
                (click)="selectCategory(cat)" type="button">{{ cat }}</button>
            }
          </div>
        </section>

        <!-- Mural -->
        @if (isLoadingServices()) {
          <div class="loading-center"><mat-spinner diameter="48" /></div>
        } @else if (filteredServices().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <p>{{ 'APP.CUSTOMER.NO_SERVICES' | translate }}</p>
            <span class="text-muted">{{ 'APP.CUSTOMER.NO_SERVICES_HINT' | translate }}</span>
          </div>
        } @else {
          <section class="mural-grid">
            @for (service of filteredServices(); track service.id) {
              <mat-card class="mural-card surface-card" [class.mural-card--expanded]="expandedId() === service.id">
                <mat-card-content>
                  <div class="card-header">
                    <div>
                      <h3 class="card-title">{{ service.name }}</h3>
                      <span class="category-badge">{{ service.category }}</span>
                    </div>
                    <div class="card-rating">
                      <mat-icon class="star-icon star--filled">star</mat-icon>
                      <span class="rating-value">{{ service.rating | number:'1.1-1' }}</span>
                      <span class="text-muted">({{ service.totalReviews }})</span>
                    </div>
                  </div>
                  <p class="card-description text-muted">{{ service.description }}</p>
                  <div class="card-meta">
                    <span class="card-price">{{ service.price }}</span>
                    <div class="card-days">
                      @for (day of service.availableDays.slice(0,3); track day) {
                        <span class="day-badge">{{ day }}</span>
                      }
                      @if (service.availableDays.length > 3) {
                        <span class="day-badge day-badge--more">+{{ service.availableDays.length - 3 }}</span>
                      }
                    </div>
                  </div>
                  <div class="card-actions">
                    <button mat-stroked-button color="primary" (click)="contactWhatsApp(service)">
                      <mat-icon>whatsapp</mat-icon>
                      {{ 'APP.CUSTOMER.CONTACT' | translate }}
                    </button>
                    <button mat-raised-button color="primary" (click)="toggleExpand(service.id)">
                      <mat-icon>{{ expandedId() === service.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                      {{ 'APP.CUSTOMER.SCHEDULE' | translate }}
                    </button>
                  </div>
                  @if (expandedId() === service.id) {
                    <mat-divider class="m-y-3" />
                    <h4 class="details-title">{{ 'APP.CUSTOMER.SCHEDULE_TITLE' | translate }}</h4>
                    <div class="days-picker">
                      @for (day of service.availableDays; track day) {
                        <button class="day-pick-btn"
                          [class.day-pick-btn--selected]="selectedDay() === day + service.id"
                          (click)="selectDay(day + service.id)">{{ day }}</button>
                      }
                    </div>
                    @if (selectedDay()?.endsWith(service.id)) {
                      <button mat-raised-button color="accent" class="w-full m-t-3"
                        [disabled]="isScheduling() === service.id" (click)="onSchedule(service)">
                        @if (isScheduling() === service.id) { <mat-spinner diameter="18" /> }
                        <mat-icon>event_available</mat-icon>
                        {{ 'APP.CUSTOMER.SCHEDULE_CONFIRM' | translate }}
                      </button>
                    }
                    <mat-divider class="m-y-3" />
                    <h4 class="details-title">{{ 'APP.CUSTOMER.REVIEWS_TITLE' | translate }}</h4>
                    @if (service.totalReviews === 0) {
                      <p class="text-muted">{{ 'APP.CUSTOMER.NO_REVIEWS' | translate }}</p>
                    } @else {
                      <div class="reviews-summary">
                        <span class="review-rating-value">{{ service.rating | number:'1.1-1' }}</span>
                        <div class="review-stars">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon class="star-icon" [class.star--filled]="star <= service.rating">star</mat-icon>
                          }
                        </div>
                        <span class="text-muted">{{ service.totalReviews }} {{ 'APP.CUSTOMER.RATING' | translate }}</span>
                      </div>
                    }
                  }
                </mat-card-content>
              </mat-card>
            }
          </section>
        }
      </main>
    </div>
  `,
  styles: [`
    .customer-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .customer-main {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .hero-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 6px;
    }
    .hero-stats {
      display: flex;
      gap: 24px;
      flex-shrink: 0;
    }
    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .hero-stat-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--mat-sys-primary);
    }
    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .search-field {
      width: 100%;
    }
    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cat-chip {
      padding: 6px 16px;
      border-radius: 999px;
      border: 1.5px solid var(--mat-sys-outline-variant);
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--mat-sys-on-surface-variant);
    }
    .cat-chip:hover {
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-primary);
    }
    .cat-chip--active {
      background: var(--mat-sys-primary);
      border-color: var(--mat-sys-primary);
      color: white;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 24px;
      border: 2px dashed var(--mat-sys-outline-variant);
      border-radius: 16px;
      text-align: center;
    }
    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--mat-sys-on-surface-variant);
    }
    .mural-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
      align-items: start;
    }
    .mural-card {
      padding: 20px;
      transition: box-shadow 0.2s;
    }
    .mural-card--expanded {
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    }
    .category-badge {
      font-size: 11px; padding: 2px 8px; border-radius: 999px;
      background: color-mix(in oklab, var(--mat-sys-primary) 12%, transparent);
      color: var(--mat-sys-primary); font-weight: 600;
    }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .star-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mat-sys-outline-variant);
    }
    .star--filled {
      color: #f59e0b;
    }
    .rating-label {
      font-size: 12px;
      margin-left: 4px;
    }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .card-title { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
    .card-rating { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 600; }
    .card-description { font-size: 14px; margin: 8px 0; line-height: 1.5; }
    .card-meta { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; }
    .card-price { font-weight: 700; color: var(--mat-sys-primary); font-size: 15px; }
    .card-days { display: flex; gap: 4px; flex-wrap: wrap; }
    .day-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: var(--mat-sys-surface-variant); color: var(--mat-sys-on-surface-variant); }
    .day-badge--more { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .card-actions { display: flex; gap: 8px; margin-top: 12px; }
    .card-actions button { flex: 1; }
    .details-title { font-size: 14px; font-weight: 700; margin: 0 0 8px; }
    .days-picker { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
    .day-pick-btn { padding: 6px 14px; border-radius: 999px; border: 1.5px solid var(--mat-sys-outline-variant); background: transparent; cursor: pointer; font-size: 13px; transition: all 0.15s; color: var(--mat-sys-on-surface); }
    .day-pick-btn:hover { border-color: var(--mat-sys-primary); color: var(--mat-sys-primary); }
    .day-pick-btn--selected { background: var(--mat-sys-primary); border-color: var(--mat-sys-primary); color: white; }
    .reviews-summary { display: flex; align-items: center; gap: 12px; }
    .review-rating-value { font-size: 32px; font-weight: 800; }
    .review-stars { display: flex; }
    @media (max-width: 768px) {
      .hero-section { flex-direction: column; align-items: flex-start; }
      .hero-stats { align-self: flex-start; }
      .customer-main { padding: 16px; gap: 20px; }
    }
    @media (max-width: 600px) {
      .mural-grid { grid-template-columns: 1fr; }
      .card-actions { flex-direction: column; }
      .card-actions button { width: 100%; flex: none; }
      .card-meta { flex-direction: column; align-items: flex-start; gap: 6px; }
      .hero-stat-value { font-size: 22px; }
      .category-chips { gap: 6px; }
      .cat-chip { padding: 5px 12px; font-size: 12px; }
      .reviews-summary { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 400px) {
      .hero-stats { flex-direction: column; gap: 8px; }
    }
  `],
})
export class CustomerDashboardComponent extends BaseComponent implements OnInit {
  private readonly onboardingService = inject(OnboardingService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly reviewApi = inject(ReviewApiService);

  allServices = signal<ServiceDto[]>([]);
  selectedCategory = signal('Todas');
  expandedId = signal<string | null>(null);
  selectedDay = signal<string | null>(null);
  isLoadingServices = signal(false);
  isScheduling = signal<string | null>(null);
  isReviewing = signal<string | null>(null);
  searchControl = new FormControl('');
  private readonly searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  readonly categories = [...CATEGORIES];
  readonly weekdays = WEEKDAYS;

  uniqueProviders = computed(() => {
    const ids = new Set(this.allServices().map((s) => s.providerId));
    return ids.size;
  });

  filteredServices = computed(() => {
    let list = this.allServices();
    const cat = this.selectedCategory();
    const day = this.selectedDay();
    const search = (this.searchValue() ?? '').toLowerCase().trim();
    if (cat && cat !== 'Todas') {
      list = list.filter((s) => s.category === cat);
    }
    if (day) {
      list = list.filter((s) => s.availableDays.includes(day));
    }
    if (search) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search) ||
          s.category.toLowerCase().includes(search),
      );
    }
    return list;
  });

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

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
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

  contactWhatsApp(service: ServiceDto): void {
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

  submitReview(service: ServiceDto, rating: number, comment: string): void {
    this.isReviewing.set(service.id);
    const payload: CreateReviewPayload = {
      serviceId: service.id,
      rating,
      comment: comment || undefined,
    };
    this.reviewApi.create(payload).subscribe({
      next: () => {
        this.isReviewing.set(null);
        // Recarrega o serviço para atualizar o rating exibido
        this.serviceApi.findOne(service.id).subscribe({
          next: (updated) => {
            this.allServices.update((list) =>
              list.map((s) => (s.id === updated.id ? updated : s)),
            );
          },
        });
      },
      error: () => {
        this.isReviewing.set(null);
      },
    });
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
