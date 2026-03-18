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
import { AppointmentApiService, CreateAppointmentPayload, AvailableDate } from '../../../core/services/appointment-api.service';
import { ReviewApiService, AnonymousReviewDto, CreateReviewPayload } from '../../../core/services/review-api.service';
import { TranslateModule } from '@ngx-translate/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

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
                    <button mat-raised-button color="primary" (click)="toggleExpand(service)">
                      <mat-icon>{{ expandedId() === service.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                      {{ 'APP.CUSTOMER.SCHEDULE' | translate }}
                    </button>
                  </div>
                  @if (expandedId() === service.id) {
                    <mat-divider class="m-y-3" />

                    <!-- Calendário de agendamento -->
                    <h4 class="details-title">
                      <mat-icon class="details-icon">event</mat-icon>
                      {{ 'APP.CUSTOMER.SCHEDULE_TITLE' | translate }}
                    </h4>

                    @if (isLoadingDates() === service.id) {
                      <div class="loading-center"><mat-spinner diameter="28" /></div>
                    } @else if (availableDatesMap()[service.id]?.length === 0) {
                      <p class="text-muted">{{ 'APP.CUSTOMER.NO_AVAILABLE_DATES' | translate }}</p>
                    } @else if (availableDatesMap()[service.id]) {
                      <div class="calendar-grid">
                        @for (dateInfo of availableDatesMap()[service.id]; track dateInfo.date) {
                          <button class="calendar-day-btn"
                            [class.calendar-day-btn--selected]="getSelectedDate(service.id) === dateInfo.date"
                            (click)="selectDate(service.id, dateInfo.date)">
                            <span class="cal-day-name">{{ dateInfo.day }}</span>
                            <span class="cal-day-date">{{ formatDate(dateInfo.date) }}</span>
                          </button>
                        }
                      </div>

                      @if (getSelectedDate(service.id)) {
                        <div class="slots-row">
                          <span class="text-muted" style="font-size:13px">Horário:</span>
                          @for (slot of getSlotsForDate(service.id, getSelectedDate(service.id)!); track slot) {
                            <button class="slot-btn"
                              [class.slot-btn--selected]="getSelectedSlot(service.id) === slot"
                              (click)="selectSlot(service.id, slot)">{{ slot }}</button>
                          }
                          @if (getSlotsForDate(service.id, getSelectedDate(service.id)!).length === 0) {
                            <span class="text-muted" style="font-size:13px">Qualquer horário</span>
                          }
                        </div>

                        <div class="booking-summary">
                          @if ((service)?.priceInCents) {
                            <div class="price-display">
                              <mat-icon>payments</mat-icon>
                              <span>{{ formatPrice((service)?.priceInCents || 0) }}</span>
                              <span class="text-muted" style="font-size:12px">(5% taxa de serviço incluída)</span>
                            </div>
                          }
                          <button mat-raised-button color="accent" class="w-full"
                            [disabled]="isScheduling() === service.id"
                            (click)="onScheduleAndPay(service)">
                            @if (isScheduling() === service.id) { <mat-spinner diameter="18" /> }
                            <mat-icon>{{ (service)?.priceInCents ? 'payment' : 'event_available' }}</mat-icon>
                            {{ (service)?.priceInCents ? ('APP.CUSTOMER.SCHEDULE_AND_PAY' | translate) : ('APP.CUSTOMER.SCHEDULE_CONFIRM' | translate) }}
                          </button>
                        </div>
                      }
                    } @else {
                      <button mat-stroked-button (click)="loadAvailableDates(service.id)" style="width:100%">
                        <mat-icon>calendar_today</mat-icon>
                        {{ 'APP.CUSTOMER.LOAD_DATES' | translate }}
                      </button>
                    }

                    <mat-divider class="m-y-3" />

                    <!-- Avaliações anônimas -->
                    <h4 class="details-title">
                      <mat-icon class="details-icon">star_rate</mat-icon>
                      {{ 'APP.CUSTOMER.REVIEWS_TITLE' | translate }}
                    </h4>

                    @if (service.totalReviews > 0) {
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

                    @if (isLoadingReviews() === service.id) {
                      <div class="loading-center"><mat-spinner diameter="28" /></div>
                    } @else if (reviewsMap()[service.id]?.length) {
                      <div class="reviews-list">
                        @for (review of reviewsMap()[service.id]; track review.id) {
                          <div class="review-item">
                            <div class="review-stars-row">
                              @for (star of [1,2,3,4,5]; track star) {
                                <mat-icon class="star-icon-sm" [class.star--filled]="star <= review.rating">star</mat-icon>
                              }
                              <span class="review-date text-muted">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
                            </div>
                            @if (review.comment) {
                              <p class="review-comment">"{{ review.comment }}"</p>
                            }
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-muted">{{ 'APP.CUSTOMER.NO_REVIEWS' | translate }}</p>
                    }

                    <mat-divider class="m-y-3" />

                    <!-- Formulário de avaliação anônima -->
                    <h4 class="details-title">
                      <mat-icon class="details-icon">rate_review</mat-icon>
                      {{ 'APP.CUSTOMER.WRITE_REVIEW' | translate }}
                    </h4>
                    <div class="review-form">
                      <div class="star-selector">
                        <span class="text-muted">{{ 'APP.CUSTOMER.YOUR_RATING' | translate }}</span>
                        <div class="star-selector-stars">
                          @for (star of [1,2,3,4,5]; track star) {
                            <button class="star-btn" type="button"
                              (mouseenter)="hoverStar(service.id, star)"
                              (mouseleave)="hoverStar(service.id, 0)"
                              (click)="setRating(service.id, star)">
                              <mat-icon class="star-icon-lg"
                                [class.star--filled]="star <= (hoverRating()[service.id] || pendingRating()[service.id] || 0)">
                                star
                              </mat-icon>
                            </button>
                          }
                        </div>
                        @if (pendingRating()[service.id]) {
                          <span class="rating-label-text">{{ getRatingLabel(pendingRating()[service.id]) }}</span>
                        }
                      </div>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>{{ 'APP.CUSTOMER.REVIEW_COMMENT' | translate }}</mat-label>
                        <textarea matInput rows="3" maxlength="500"
                          [value]="pendingComment()[service.id] || ''"
                          (input)="setComment(service.id, $any($event.target).value)"
                          [placeholder]="'APP.CUSTOMER.REVIEW_COMMENT_HINT' | translate"></textarea>
                        <mat-hint>{{ 'APP.CUSTOMER.REVIEW_ANONYMOUS_HINT' | translate }}</mat-hint>
                      </mat-form-field>
                      <button mat-raised-button color="primary" class="w-full" type="button"
                        [disabled]="!pendingRating()[service.id] || isReviewing() === service.id"
                        (click)="submitReview(service)">
                        @if (isReviewing() === service.id) { <mat-spinner diameter="18" /> }
                        <mat-icon>send</mat-icon>
                        {{ 'APP.CUSTOMER.SUBMIT_REVIEW' | translate }}
                      </button>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            }
          </section>
        }
        <!-- Seção: Meus Agendamentos -->
        @if (myAppointments().length > 0) {
          <section class="my-appointments-section">
            <h2 class="section-title">
              <mat-icon>event_note</mat-icon>
              {{ 'APP.CUSTOMER.MY_APPOINTMENTS' | translate }}
            </h2>
            <div class="appointments-list">
              @for (appt of myAppointments(); track appt.id) {
                <mat-card class="appointment-card surface-card">
                  <mat-card-content>
                    <div class="appt-header">
                      <div>
                        <h4 class="appt-service-name">{{ appt.service?.name }}</h4>
                        <span class="appt-date">{{ appt.scheduledDate | date:'dd/MM/yyyy' }}
                          @if (appt.scheduledSlot) { · {{ appt.scheduledSlot }} }
                        </span>
                      </div>
                      <span class="appt-status-badge" [style.background]="getStatusColor(appt.status) + '22'" [style.color]="getStatusColor(appt.status)">
                        {{ getStatusLabel(appt.status) }}
                      </span>
                    </div>
                    @if (appt.amountInCents) {
                      <p class="appt-price">{{ formatPrice(appt.amountInCents) }}</p>
                    }
                    <div class="appt-actions">
                      @if (appt.status === 'confirmed' || appt.status === 'in_progress') {
                        <button mat-raised-button color="primary"
                          [disabled]="isConfirmingCompletion() === appt.id"
                          (click)="confirmServiceCompleted(appt.id)">
                          @if (isConfirmingCompletion() === appt.id) { <mat-spinner diameter="16" /> }
                          <mat-icon>check_circle</mat-icon>
                          {{ 'APP.CUSTOMER.CONFIRM_COMPLETED' | translate }}
                        </button>
                        <button mat-stroked-button color="warn"
                          [disabled]="isCancelling() === appt.id"
                          (click)="cancelAppointment(appt.id)">
                          @if (isCancelling() === appt.id) { <mat-spinner diameter="16" /> }
                          <mat-icon>cancel</mat-icon>
                          {{ 'APP.CUSTOMER.CANCEL_APPOINTMENT' | translate }}
                        </button>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </section>
        }
      </main>

      <!-- Modal de Pagamento Stripe -->
      @if (showPaymentModal()) {
        <div class="payment-modal-overlay" (click)="closePaymentModal()">
          <div class="payment-modal" (click)="$event.stopPropagation()">
            <div class="payment-modal-header">
              <h3>
                <mat-icon>payment</mat-icon>
                {{ 'APP.CUSTOMER.PAYMENT_TITLE' | translate }}
              </h3>
              <button mat-icon-button (click)="closePaymentModal()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="payment-modal-body">
              <div class="payment-amount">
                <span class="text-muted">{{ 'APP.CUSTOMER.PAYMENT_AMOUNT' | translate }}</span>
                <span class="payment-amount-value">{{ formatPrice(paymentAmountInCents()) }}</span>
              </div>
              <div class="payment-info-box">
                <mat-icon style="font-size:16px;width:16px;height:16px;color:var(--mat-sys-primary)">info</mat-icon>
                <span>{{ 'APP.CUSTOMER.PAYMENT_ESCROW_INFO' | translate }}</span>
              </div>
              <!-- Stripe Payment Element será montado aqui -->
              <div id="stripe-payment-element" class="stripe-element-container"></div>
              @if (paymentError()) {
                <p class="payment-error">{{ paymentError() }}</p>
              }
              <button mat-raised-button color="primary" class="w-full payment-confirm-btn"
                [disabled]="isProcessingPayment()"
                (click)="confirmPayment()">
                @if (isProcessingPayment()) { <mat-spinner diameter="20" /> }
                <mat-icon>lock</mat-icon>
                {{ 'APP.CUSTOMER.PAYMENT_CONFIRM' | translate }}
              </button>
              <p class="payment-security-note">
                <mat-icon style="font-size:14px;width:14px;height:14px">security</mat-icon>
                {{ 'APP.CUSTOMER.PAYMENT_SECURITY' | translate }}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./customer-dashboard.component.scss'],
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
  isLoadingReviews = signal<string | null>(null);

  // ── Estado de calendário e agendamento ──────────────────────────────────────────
  availableDatesMap = signal<Record<string, AvailableDate[]>>({});
  isLoadingDates = signal<string | null>(null);
  selectedDate = signal<string | null>(null);
  selectedSlot = signal<string | null>(null);
  pendingAppointmentId = signal<string | null>(null);

  // ── Estado de pagamento Stripe ────────────────────────────────────────────────────
  showPaymentModal = signal(false);
  isProcessingPayment = signal(false);
  paymentClientSecret = signal<string | null>(null);
  paymentAmountInCents = signal<number>(0);
  paymentAppointmentId = signal<string | null>(null);
  paymentError = signal<string | null>(null);
  private stripe: Stripe | null = null;
  private stripeElements: StripeElements | null = null;
  private cardElement: any = null;

  // ── Estado de confirmação de conclusão ─────────────────────────────────────────────
  myAppointments = signal<any[]>([]);
  isConfirmingCompletion = signal<string | null>(null);
  isCancelling = signal<string | null>(null);

  // ── Estado de avaliação ────────────────────────────────────────────────────────
  reviewsMap = signal<Record<string, any[]>>({});
  pendingRating = signal<Record<string, number>>({});
  pendingComment = signal<Record<string, string>>({});
  hoverRating = signal<Record<string, number>>({});
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

  toggleExpand(service: ServiceDto): void {
    const isOpening = this.expandedId() !== service.id;
    this.expandedId.set(isOpening ? service.id : null);
    if (isOpening) {
      this.serviceApi.trackMetric(service.id, 'clicks').subscribe();
      this.loadReviews(service.id);
    }
  }

  private loadReviews(serviceId: string): void {
    if (this.reviewsMap()[serviceId]) return;
    this.isLoadingReviews.set(serviceId);
    this.reviewApi.findByService(serviceId).subscribe({
      next: (reviews) => {
        this.reviewsMap.update((m) => ({ ...m, [serviceId]: reviews }));
        this.isLoadingReviews.set(null);
      },
      error: () => { this.isLoadingReviews.set(null); },
    });
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
    this.serviceApi.trackMetric(service.id, 'interests').subscribe();
    const phone = service.contact.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Vi seu serviço "${service.name}" no Mural do Condomínio e gostaria de mais informações.`,
    );
    const url = `https://wa.me/55${phone}?text=${message}`;
    window.open(url, '_blank');
  }

  // ── Calendário de disponibilidade ────────────────────────────────────────────────────

  /** Carrega os dias disponíveis do serviço ao expandir o card */
  loadAvailableDates(serviceId: string): void {
    if (this.availableDatesMap()[serviceId]) return;
    this.isLoadingDates.set(serviceId);
    this.appointmentApi.getAvailableDates(serviceId, 30).subscribe({
      next: (dates) => {
        this.availableDatesMap.update((m) => ({ ...m, [serviceId]: dates }));
        this.isLoadingDates.set(null);
      },
      error: () => { this.isLoadingDates.set(null); },
    });
  }

  selectDate(serviceId: string, date: string): void {
    const key = serviceId + '|' + date;
    this.selectedDate.set(this.selectedDate() === key ? null : key);
    this.selectedSlot.set(null);
  }

  selectSlot(serviceId: string, slot: string): void {
    const key = serviceId + '|' + slot;
    this.selectedSlot.set(this.selectedSlot() === key ? null : key);
  }

  getSelectedDate(serviceId: string): string | null {
    const key = this.selectedDate();
    if (!key?.startsWith(serviceId + '|')) return null;
    return key.split('|')[1];
  }

  getSelectedSlot(serviceId: string): string | null {
    const key = this.selectedSlot();
    if (!key?.startsWith(serviceId + '|')) return null;
    return key.split('|')[1];
  }

  getSlotsForDate(serviceId: string, date: string): string[] {
    const dates = this.availableDatesMap()[serviceId] ?? [];
    return dates.find((d) => d.date === date)?.slots ?? [];
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /** Cria o agendamento e inicia o pagamento */
  onScheduleAndPay(service: ServiceDto): void {
    const date = this.getSelectedDate(service.id);
    const slot = this.getSelectedSlot(service.id);
    if (!date) return;

    const dates = this.availableDatesMap()[service.id] ?? [];
    const dayInfo = dates.find((d) => d.date === date);
    const dayName = dayInfo?.day ?? date;

    this.isScheduling.set(service.id);
    const payload: CreateAppointmentPayload = {
      serviceId: service.id,
      scheduledDate: date,
      scheduledDay: dayName,
      scheduledSlot: slot ?? undefined,
    };

    this.appointmentApi.create(payload).subscribe({
      next: (appointment) => {
        this.isScheduling.set(null);
        this.pendingAppointmentId.set(appointment.id);
        if ((service as any).priceInCents && (service as any).priceInCents > 0) {
          this.initiatePayment(appointment.id, (service as any).priceInCents);
        } else {
          this.selectedDate.set(null);
          this.selectedSlot.set(null);
        }
      },
      error: () => { this.isScheduling.set(null); },
    });
  }

  // ── Pagamento Stripe ────────────────────────────────────────────────────────────────

  private initiatePayment(appointmentId: string, amountInCents: number): void {
    this.appointmentApi.initiatePayment(appointmentId).subscribe({
      next: async (res) => {
        this.paymentClientSecret.set(res.clientSecret);
        this.paymentAmountInCents.set(res.amountInCents);
        this.paymentAppointmentId.set(appointmentId);
        this.paymentError.set(null);
        this.showPaymentModal.set(true);
        setTimeout(() => this.initStripeElements(), 200);
      },
    });
  }

  private async initStripeElements(): Promise<void> {
    const publishableKey = (window as any).__STRIPE_PUBLISHABLE_KEY__ || 'pk_test_placeholder';
    this.stripe = await loadStripe(publishableKey);
    if (!this.stripe) return;
    this.stripeElements = this.stripe.elements({ clientSecret: this.paymentClientSecret()! });
    this.cardElement = this.stripeElements.create('payment');
    this.cardElement.mount('#stripe-payment-element');
  }

  async confirmPayment(): Promise<void> {
    if (!this.stripe || !this.stripeElements) return;
    this.isProcessingPayment.set(true);
    this.paymentError.set(null);
    const { error } = await this.stripe.confirmPayment({
      elements: this.stripeElements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) {
      this.paymentError.set(error.message ?? 'Erro ao processar pagamento.');
      this.isProcessingPayment.set(false);
    } else {
      this.isProcessingPayment.set(false);
      this.showPaymentModal.set(false);
      this.selectedDate.set(null);
      this.selectedSlot.set(null);
      this.loadMyAppointments();
    }
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    if (this.cardElement) { this.cardElement.destroy(); this.cardElement = null; }
  }

  // ── Meus agendamentos ────────────────────────────────────────────────────────────────

  loadMyAppointments(): void {
    this.appointmentApi.findMine().subscribe({
      next: (list) => this.myAppointments.set(list),
    });
  }

  confirmServiceCompleted(appointmentId: string): void {
    this.isConfirmingCompletion.set(appointmentId);
    this.appointmentApi.confirmCompleted(appointmentId).subscribe({
      next: (updated) => {
        this.isConfirmingCompletion.set(null);
        this.myAppointments.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      },
      error: () => { this.isConfirmingCompletion.set(null); },
    });
  }

  cancelAppointment(appointmentId: string): void {
    this.isCancelling.set(appointmentId);
    this.appointmentApi.cancel(appointmentId).subscribe({
      next: (updated) => {
        this.isCancelling.set(null);
        this.myAppointments.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      },
      error: () => { this.isCancelling.set(null); },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending_payment: 'Aguardando pagamento',
      confirmed: 'Confirmado',
      in_progress: 'Em andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending_payment: '#f59e0b',
      confirmed: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280',
    };
    return colors[status] ?? '#6b7280';
  }

  scheduleService(service: ServiceDto, day: string): void {
    this.onScheduleAndPay(service);
  }

  // ── Avaliação anônima ────────────────────────────────────────────────────
  hoverStar(serviceId: string, star: number): void {
    this.hoverRating.update((m) => ({ ...m, [serviceId]: star }));
  }

  setRating(serviceId: string, star: number): void {
    this.pendingRating.update((m) => ({ ...m, [serviceId]: star }));
  }

  setComment(serviceId: string, text: string): void {
    this.pendingComment.update((m) => ({ ...m, [serviceId]: text }));
  }

  getRatingLabel(rating: number): string {
    const labels: Record<number, string> = {
      1: 'Péssimo', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Excelente',
    };
    return labels[rating] ?? '';
  }

  submitReview(service: ServiceDto): void {
    const rating = this.pendingRating()[service.id];
    if (!rating) return;
    this.isReviewing.set(service.id);
    const payload: CreateReviewPayload = {
      serviceId: service.id,
      rating,
      comment: this.pendingComment()[service.id] || undefined,
    };
    this.reviewApi.create(payload).subscribe({
      next: (newReview) => {
        this.isReviewing.set(null);
        this.pendingRating.update((m) => ({ ...m, [service.id]: 0 }));
        this.pendingComment.update((m) => ({ ...m, [service.id]: '' }));
        this.reviewsMap.update((m) => ({
          ...m,
          [service.id]: [newReview, ...(m[service.id] ?? [])],
        }));
        this.serviceApi.findOne(service.id).subscribe({
          next: (updated) => {
            this.allServices.update((list) =>
              list.map((s) => (s.id === updated.id ? updated : s)),
            );
          },
        });
      },
      error: () => { this.isReviewing.set(null); },
    });
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
