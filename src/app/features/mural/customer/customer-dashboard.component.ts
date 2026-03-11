import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../../components/base.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { ServiceApiService, ServiceDto } from '../../../core/services/service-api.service';
import { AppointmentApiService, CreateAppointmentPayload } from '../../../core/services/appointment-api.service';
import { ReviewApiService, CreateReviewPayload } from '../../../core/services/review-api.service';
import { ServiceCard } from '../provider/provider-dashboard.component';

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

const MOCK_SERVICES: ServiceCard[] = [
  {
    id: '1',
    name: 'Corte de Cabelo Masculino',
    description: 'Corte profissional em casa ou na sua unidade. Mais de 5 anos de experiência. Atendo adultos e crianças.',
    price: 'R$ 35,00',
    contact: '(11) 99123-4567',
    availableDays: ['Segunda', 'Quarta', 'Sexta', 'Sábado'],
    category: 'Beleza e Estética',
    rating: 4.8,
    totalReviews: 23,
    active: true,
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Marmitas Fitness',
    description: 'Marmitas saudáveis e saborosas preparadas diariamente. Cardápio semanal variado. Entrega no condomínio.',
    price: 'R$ 18,00 / unidade',
    contact: '(11) 98765-4321',
    availableDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    category: 'Alimentação',
    rating: 4.9,
    totalReviews: 41,
    active: true,
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: '3',
    name: 'Aulas de Inglês',
    description: 'Aulas particulares de inglês para todos os níveis. Metodologia conversacional. Online ou presencial.',
    price: 'R$ 80,00 / hora',
    contact: '(11) 97654-3210',
    availableDays: ['Terça', 'Quinta', 'Sábado'],
    category: 'Aulas e Tutoria',
    rating: 5.0,
    totalReviews: 12,
    active: true,
    createdAt: '2025-02-01T09:00:00Z',
  },
  {
    id: '4',
    name: 'Manutenção Elétrica',
    description: 'Serviços elétricos residenciais: instalação de tomadas, lustres, disjuntores e muito mais. Rápido e seguro.',
    price: 'A partir de R$ 60,00',
    contact: '(11) 96543-2109',
    availableDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    category: 'Manutenção e Reparos',
    rating: 4.7,
    totalReviews: 18,
    active: true,
    createdAt: '2025-02-10T11:00:00Z',
  },
  {
    id: '5',
    name: 'Pet Sitting e Passeio',
    description: 'Cuido do seu pet com muito carinho! Passeios diários, visitas e hospedagem. Experiência com cães e gatos.',
    price: 'R$ 40,00 / passeio',
    contact: '(11) 95432-1098',
    availableDays: ['Segunda', 'Quarta', 'Sexta', 'Sábado', 'Domingo'],
    category: 'Pets',
    rating: 4.6,
    totalReviews: 9,
    active: true,
    createdAt: '2025-02-20T14:00:00Z',
  },
  {
    id: '6',
    name: 'Faxina Residencial',
    description: 'Limpeza completa do apartamento. Produtos de qualidade inclusos. Pontualidade e discrição garantidas.',
    price: 'R$ 120,00 / diária',
    contact: '(11) 94321-0987',
    availableDays: ['Terça', 'Quinta', 'Sábado'],
    category: 'Limpeza',
    rating: 4.5,
    totalReviews: 31,
    active: true,
    createdAt: '2025-03-01T07:00:00Z',
  },
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
    MatBadgeModule,
    TranslateModule,
  ],
  template: `
    <div class="customer-layout">
      <!-- Topbar -->
      <header class="customer-topbar">
        <div class="topbar-brand">
          <mat-icon class="brand-icon">dashboard</mat-icon>
          <span class="brand-name">Mural do Condomínio</span>
          <span class="app-badge badge--customer">Morador</span>
        </div>
        <div class="topbar-user">
          <span class="text-muted user-name">{{ user?.givenName || user?.displayName }}</span>
          <button mat-icon-button (click)="onLogout()" matTooltip="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </header>

      <main class="customer-main">
        <!-- Hero -->
        <section class="hero-section">
          <div>
            <h1 class="hero-title">Serviços disponíveis no seu condomínio</h1>
            <p class="text-muted hero-subtitle">
              Encontre serviços oferecidos pelos seus vizinhos em
              <strong>{{ condoCity }}</strong>.
            </p>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-value">{{ allServices().length }}</span>
              <span class="hero-stat-label text-muted">serviços disponíveis</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-value">{{ uniqueProviders() }}</span>
              <span class="hero-stat-label text-muted">prestadores ativos</span>
            </div>
          </div>
        </section>

        <!-- Filtros -->
        <section class="filters-section">
          <div class="search-wrap">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar serviço...</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [formControl]="searchControl" placeholder="Ex: corte de cabelo, marmita..." />
            </mat-form-field>
          </div>
          <div class="category-chips">
            @for (cat of categories; track cat) {
              <button
                class="cat-chip"
                [class.cat-chip--active]="selectedCategory() === cat"
                (click)="selectCategory(cat)"
                type="button"
              >
                {{ cat }}
              </button>
            }
          </div>
        </section>

        <!-- Resultados -->
        @if (filteredServices().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <h3>Nenhum serviço encontrado</h3>
            <p class="text-muted">Tente outros termos ou categorias.</p>
          </div>
        } @else {
          <section class="mural-grid">
            @for (service of filteredServices(); track service.id) {
              <mat-card
                class="mural-card surface-card--elevated"
                [class.mural-card--expanded]="expandedId() === service.id"
              >
                <mat-card-content class="p-0">
                  <div class="mural-card-top">
                    <div class="mural-card-info">
                      <div class="mural-card-title-row">
                        <h3 class="mural-card-name">{{ service.name }}</h3>
                        <span class="category-chip">{{ service.category }}</span>
                      </div>
                      <p class="mural-card-desc text-muted">{{ service.description }}</p>
                    </div>
                  </div>

                  <mat-divider class="m-y-3"></mat-divider>

                  <div class="mural-card-meta">
                    <div class="meta-item">
                      <mat-icon class="meta-icon">payments</mat-icon>
                      <strong>{{ service.price }}</strong>
                    </div>
                    <div class="meta-item">
                      <mat-icon class="meta-icon">schedule</mat-icon>
                      <span class="text-muted">{{ service.availableDays.join(', ') }}</span>
                    </div>
                  </div>

                  <div class="rating-row m-t-2">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon class="star-icon" [class.star--filled]="star <= service.rating">star</mat-icon>
                    }
                    <span class="text-muted rating-label">
                      {{ service.rating | number:'1.1-1' }} ({{ service.totalReviews }} avaliações)
                    </span>
                  </div>

                  <!-- Ações -->
                  <div class="mural-card-actions m-t-4">
                    <button
                      mat-stroked-button
                      class="w-full"
                      (click)="toggleExpand(service.id)"
                    >
                      <mat-icon>{{ expandedId() === service.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                      {{ expandedId() === service.id ? 'Menos detalhes' : 'Ver detalhes' }}
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      class="w-full"
                      (click)="onContact(service)"
                    >
                      <mat-icon>phone</mat-icon>
                      Entrar em contato
                    </button>
                  </div>

                  <!-- Detalhes expandidos -->
                  @if (expandedId() === service.id) {
                    <div class="expanded-details m-t-4">
                      <mat-divider class="m-b-3"></mat-divider>
                      <h4 class="details-title">Contato</h4>
                      <div class="meta-item m-b-3">
                        <mat-icon class="meta-icon">phone</mat-icon>
                        <span>{{ service.contact }}</span>
                      </div>

                      <h4 class="details-title">Agendar horário</h4>
                      <div class="schedule-days">
                        @for (day of service.availableDays; track day) {
                          <button
                            class="day-btn"
                            [class.day-btn--selected]="selectedDay() === day + service.id"
                            (click)="selectDay(day + service.id)"
                            type="button"
                          >
                            {{ day }}
                          </button>
                        }
                      </div>
                      @if (selectedDay()?.endsWith(service.id)) {
                        <button
                          mat-raised-button
                          color="accent"
                          class="w-full m-t-3"
                          (click)="onSchedule(service)"
                        >
                          <mat-icon>event_available</mat-icon>
                          Confirmar agendamento
                        </button>
                      }

                      <h4 class="details-title m-t-4">Avaliações</h4>
                      @if (service.totalReviews === 0) {
                        <p class="text-muted">Ainda sem avaliações.</p>
                      } @else {
                        <div class="reviews-summary">
                          <div class="review-big-rating">
                            <span class="review-rating-value">{{ service.rating | number:'1.1-1' }}</span>
                            <div class="review-stars">
                              @for (star of [1,2,3,4,5]; track star) {
                                <mat-icon class="star-icon" [class.star--filled]="star <= service.rating">star</mat-icon>
                              }
                            </div>
                            <span class="text-muted">{{ service.totalReviews }} avaliações</span>
                          </div>
                        </div>
                      }
                    </div>
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
    .customer-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      color: #0284c7;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .brand-name {
      font-weight: 700;
      font-size: 16px;
    }
    .badge--customer {
      background: color-mix(in oklab, #0284c7 18%, transparent);
      color: #0284c7;
    }
    .topbar-user {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-name {
      font-size: 14px;
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
    .hero-subtitle {
      margin: 0;
      font-size: 15px;
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
      color: #0284c7;
    }
    .hero-stat-label {
      font-size: 12px;
    }
    .filters-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .search-wrap {
      width: 100%;
      max-width: 480px;
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
      border-color: #0284c7;
      color: #0284c7;
    }
    .cat-chip--active {
      background: #0284c7;
      border-color: #0284c7;
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
    .mural-card-top {
      display: flex;
      gap: 12px;
    }
    .mural-card-info {
      flex: 1;
    }
    .mural-card-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .mural-card-name {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
    }
    .category-chip {
      font-size: 11px;
      padding: 2px 10px;
      border-radius: 999px;
      background: color-mix(in oklab, #0284c7 12%, transparent);
      color: #0284c7;
      font-weight: 600;
      white-space: nowrap;
    }
    .mural-card-desc {
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .mural-card-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .meta-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-on-surface-variant);
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
    .mural-card-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .expanded-details {
      display: flex;
      flex-direction: column;
    }
    .details-title {
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 8px;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .schedule-days {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .day-btn {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1.5px solid var(--mat-sys-outline-variant);
      background: transparent;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .day-btn:hover {
      border-color: #0284c7;
      color: #0284c7;
    }
    .day-btn--selected {
      background: #0284c7;
      border-color: #0284c7;
      color: white;
    }
    .reviews-summary {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .review-big-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .review-rating-value {
      font-size: 36px;
      font-weight: 800;
      color: #f59e0b;
    }
    .review-stars {
      display: flex;
    }
    @media (max-width: 768px) {
      .hero-section { flex-direction: column; align-items: flex-start; }
      .hero-stats { align-self: flex-start; }
      .customer-main { padding: 16px; }
    }
    @media (max-width: 480px) {
      .mural-grid { grid-template-columns: 1fr; }
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

  readonly categories = ['Todas', ...CATEGORIES];
  readonly weekdays = WEEKDAYS;

  filteredServices = computed(() => {
    let list = this.allServices();
    const cat = this.selectedCategory();
    const day = this.selectedDay();
    if (cat && cat !== 'Todas') {
      list = list.filter((s) => s.category === cat);
    }
    if (day) {
      list = list.filter((s) => s.availableDays.includes(day));
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

  filterByCategory(cat: string): void {
    this.selectedCategory.set(cat);
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
