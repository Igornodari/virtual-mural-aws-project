import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../../components/base.component';
import { OnboardingService } from '../../../core/services/onboarding.service';

export interface ServiceCard {
  id: string;
  name: string;
  description: string;
  price: string;
  contact: string;
  availableDays: string[];
  category: string;
  rating: number;
  totalReviews: number;
  active: boolean;
  createdAt: string;
}

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
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
  ],
  template: `
    <div class="provider-layout">
      <!-- Sidebar / Header -->
      <header class="provider-topbar">
        <div class="topbar-brand">
          <mat-icon class="brand-icon">storefront</mat-icon>
          <span class="brand-name">Mural do Condomínio</span>
          <span class="app-badge badge--provider">Prestador</span>
        </div>
        <div class="topbar-user">
          <span class="text-muted user-name">{{ user?.givenName || user?.displayName }}</span>
          <button mat-icon-button (click)="onLogout()" matTooltip="Sair">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </header>

      <main class="provider-main">
        <!-- Stats -->
        <section class="stats-row">
          <div class="stat-card">
            <mat-icon class="stat-icon" style="color:#7c3aed">storefront</mat-icon>
            <div>
              <span class="stat-value">{{ services().length }}</span>
              <span class="stat-label">Serviços ativos</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon" style="color:#0284c7">star</mat-icon>
            <div>
              <span class="stat-value">{{ averageRating() | number:'1.1-1' }}</span>
              <span class="stat-label">Avaliação média</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon" style="color:#16a34a">rate_review</mat-icon>
            <div>
              <span class="stat-value">{{ totalReviews() }}</span>
              <span class="stat-label">Avaliações recebidas</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon" style="color:#ea580c">location_city</mat-icon>
            <div>
              <span class="stat-value">{{ condoCity }}</span>
              <span class="stat-label">Seu condomínio</span>
            </div>
          </div>
        </section>

        <!-- Meus Serviços -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Meus serviços no mural</h2>
            <button mat-raised-button color="primary" (click)="openForm()">
              <mat-icon>add</mat-icon>
              Novo serviço
            </button>
          </div>

          @if (services().length === 0) {
            <div class="empty-state">
              <mat-icon class="empty-icon">storefront</mat-icon>
              <h3>Nenhum serviço publicado ainda</h3>
              <p class="text-muted">Crie seu primeiro card e apareça no mural do condomínio.</p>
              <button mat-raised-button color="primary" (click)="openForm()">
                Criar primeiro serviço
              </button>
            </div>
          } @else {
            <div class="services-grid">
              @for (service of services(); track service.id) {
                <mat-card class="service-card surface-card--elevated">
                  <mat-card-header class="p-0 m-b-3">
                    <div class="service-card-header">
                      <div>
                        <mat-card-title class="service-name">{{ service.name }}</mat-card-title>
                        <span class="category-chip">{{ service.category }}</span>
                      </div>
                      <div class="service-actions">
                        <button mat-icon-button (click)="editService(service)" matTooltip="Editar">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="removeService(service.id)" matTooltip="Remover">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </mat-card-header>
                  <mat-card-content class="p-0">
                    <p class="service-desc text-muted">{{ service.description }}</p>
                    <mat-divider class="m-y-3"></mat-divider>
                    <div class="service-meta">
                      <div class="meta-item">
                        <mat-icon class="meta-icon">payments</mat-icon>
                        <span>{{ service.price }}</span>
                      </div>
                      <div class="meta-item">
                        <mat-icon class="meta-icon">phone</mat-icon>
                        <span>{{ service.contact }}</span>
                      </div>
                    </div>
                    <div class="days-row m-t-3">
                      @for (day of service.availableDays; track day) {
                        <span class="day-chip">{{ day }}</span>
                      }
                    </div>
                    <div class="rating-row m-t-3">
                      @for (star of [1,2,3,4,5]; track star) {
                        <mat-icon class="star-icon" [class.star--filled]="star <= service.rating">star</mat-icon>
                      }
                      <span class="text-muted rating-count">({{ service.totalReviews }} avaliações)</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          }
        </section>

        <!-- Formulário inline de criação/edição -->
        @if (showForm()) {
          <section class="section form-section">
            <div class="section-header">
              <h2 class="section-title">{{ editingId() ? 'Editar serviço' : 'Novo serviço' }}</h2>
              <button mat-icon-button (click)="closeForm()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <mat-card class="surface-card--elevated">
              <mat-card-content>
                <form [formGroup]="serviceForm" (ngSubmit)="onSaveService()" class="d-flex flex-col gap-4">
                  <div class="two-col">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Nome do serviço</mat-label>
                      <input matInput formControlName="name" placeholder="Ex: Corte de cabelo" />
                      @if (serviceForm.controls.name.touched && serviceForm.controls.name.invalid) {
                        <mat-error>Informe o nome do serviço.</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Categoria</mat-label>
                      <mat-select formControlName="category">
                        @for (cat of categories; track cat) {
                          <mat-option [value]="cat">{{ cat }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Descrição</mat-label>
                    <textarea
                      matInput
                      formControlName="description"
                      rows="3"
                      placeholder="Descreva o serviço, experiência, diferenciais..."
                    ></textarea>
                    @if (serviceForm.controls.description.touched && serviceForm.controls.description.invalid) {
                      <mat-error>Informe uma descrição.</mat-error>
                    }
                  </mat-form-field>

                  <div class="two-col">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Preço</mat-label>
                      <input matInput formControlName="price" placeholder="Ex: R$ 50,00 / hora" />
                      @if (serviceForm.controls.price.touched && serviceForm.controls.price.invalid) {
                        <mat-error>Informe o preço.</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Contato (WhatsApp ou telefone)</mat-label>
                      <input matInput formControlName="contact" placeholder="(11) 99999-9999" />
                      @if (serviceForm.controls.contact.touched && serviceForm.controls.contact.invalid) {
                        <mat-error>Informe o contato.</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Dias disponíveis</mat-label>
                    <mat-select formControlName="availableDays" multiple>
                      @for (day of weekdays; track day) {
                        <mat-option [value]="day">{{ day }}</mat-option>
                      }
                    </mat-select>
                    @if (serviceForm.controls.availableDays.touched && serviceForm.controls.availableDays.invalid) {
                      <mat-error>Selecione ao menos um dia.</mat-error>
                    }
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-stroked-button type="button" (click)="closeForm()">Cancelar</button>
                    <button mat-raised-button color="primary" type="submit" [disabled]="serviceForm.invalid">
                      {{ editingId() ? 'Salvar alterações' : 'Publicar no mural' }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </section>
        }
      </main>
    </div>
  `,
  styles: [`
    .provider-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .provider-topbar {
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
      color: #7c3aed;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .brand-name {
      font-weight: 700;
      font-size: 16px;
    }
    .badge--provider {
      background: color-mix(in oklab, #7c3aed 18%, transparent);
      color: #7c3aed;
    }
    .topbar-user {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-name {
      font-size: 14px;
    }
    .provider-main {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px;
      border-radius: 14px;
      border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
    }
    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
    }
    .stat-label {
      display: block;
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
    }
    .section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
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
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .service-card {
      padding: 20px;
    }
    .service-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }
    .service-name {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .category-chip {
      font-size: 11px;
      padding: 2px 10px;
      border-radius: 999px;
      background: color-mix(in oklab, #7c3aed 12%, transparent);
      color: #7c3aed;
      font-weight: 600;
    }
    .service-actions {
      display: flex;
      gap: 4px;
    }
    .service-desc {
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .service-meta {
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
    .days-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .day-chip {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 999px;
      background: color-mix(in oklab, #0284c7 12%, transparent);
      color: #0284c7;
      font-weight: 600;
    }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .star-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-outline-variant);
    }
    .star--filled {
      color: #f59e0b;
    }
    .rating-count {
      font-size: 12px;
      margin-left: 4px;
    }
    .form-section {
      padding-bottom: 40px;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    @media (max-width: 900px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr; }
      .two-col { grid-template-columns: 1fr; }
      .provider-main { padding: 16px; }
    }
  `],
})
export class ProviderDashboardComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);

  readonly weekdays = WEEKDAYS;
  readonly categories = CATEGORIES;

  services = signal<ServiceCard[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  serviceForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    contact: ['', Validators.required],
    availableDays: [[] as string[], Validators.required],
  });

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || 'Não definido';
  }

  averageRating = signal(0);
  totalReviews = signal(0);

  constructor() {
    super({ loadUnit: false });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('PROVIDER_SERVICES') : null;
      if (raw) {
        const list = JSON.parse(raw) as ServiceCard[];
        this.services.set(list);
        this.recalcStats(list);
      }
    } catch (e) {
      // Ignorar erro
    }
  }

  private saveServices(list: ServiceCard[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('PROVIDER_SERVICES', JSON.stringify(list));
      }
    } catch (e) {
      // Ignorar erro
    }
    this.services.set(list);
    this.recalcStats(list);
  }

  private recalcStats(list: ServiceCard[]): void {
    if (list.length === 0) {
      this.averageRating.set(0);
      this.totalReviews.set(0);
      return;
    }
    const total = list.reduce((sum, s) => sum + s.totalReviews, 0);
    const avg = list.reduce((sum, s) => sum + s.rating * s.totalReviews, 0) / (total || 1);
    this.totalReviews.set(total);
    this.averageRating.set(avg);
  }

  openForm(): void {
    this.editingId.set(null);
    this.serviceForm.reset({ availableDays: [] });
    this.showForm.set(true);
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  editService(service: ServiceCard): void {
    this.editingId.set(service.id);
    this.serviceForm.patchValue({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      contact: service.contact,
      availableDays: service.availableDays,
    });
    this.showForm.set(true);
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.serviceForm.reset({ availableDays: [] });
  }

  onSaveService(): void {
    if (this.serviceForm.invalid) return;

    const raw = this.serviceForm.getRawValue();
    const current = this.services();
    const editId = this.editingId();

    if (editId) {
      const updated = current.map((s) =>
        s.id === editId
          ? { ...s, ...raw }
          : s
      );
      this.saveServices(updated);
    } else {
      const newService: ServiceCard = {
        id: Date.now().toString(),
        ...raw,
        rating: 0,
        totalReviews: 0,
        active: true,
        createdAt: new Date().toISOString(),
      };
      this.saveServices([...current, newService]);
    }

    this.closeForm();
  }

  removeService(id: string): void {
    const updated = this.services().filter((s) => s.id !== id);
    this.saveServices(updated);
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
