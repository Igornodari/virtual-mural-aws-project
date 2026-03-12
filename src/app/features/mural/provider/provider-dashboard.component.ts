import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../../components/base.component';
import { MuralTopbarComponent } from '../../../components/mural-topbar/mural-topbar.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { ServiceApiService, ServiceDto, CreateServicePayload } from '../../../core/services/service-api.service';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const CATEGORIES = [
  'Beleza e Estética', 'Manutenção e Reparos', 'Alimentação',
  'Aulas e Tutoria', 'Pets', 'Limpeza', 'Tecnologia',
  'Saúde e Bem-estar', 'Outros',
];

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule,
    MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressSpinnerModule, MatSelectModule, MatTooltipModule,
    TranslateModule, MuralTopbarComponent,
  ],
  template: `
    <div class="provider-layout">
      <app-mural-topbar
        role="provider"
        [userName]="user?.givenName || user?.displayName || ''"
        (logout)="onLogout()"
      />

      <main class="provider-main">
        <section class="stats-row">
          <div class="stat-card surface-card">
            <mat-icon class="stat-icon" style="color:#7c3aed">storefront</mat-icon>
            <div>
              <span class="stat-value">{{ services().length }}</span>
              <span class="stat-label text-muted">{{ 'APP.PROVIDER.STATS_SERVICES' | translate }}</span>
            </div>
          </div>
          <div class="stat-card surface-card">
            <mat-icon class="stat-icon" style="color:#f59e0b">star</mat-icon>
            <div>
              <span class="stat-value">{{ averageRating() | number:'1.1-1' }}</span>
              <span class="stat-label text-muted">{{ 'APP.PROVIDER.STATS_RATING' | translate }}</span>
            </div>
          </div>
          <div class="stat-card surface-card">
            <mat-icon class="stat-icon" style="color:#10b981">rate_review</mat-icon>
            <div>
              <span class="stat-value">{{ totalReviews() }}</span>
              <span class="stat-label text-muted">{{ 'APP.PROVIDER.STATS_REVIEWS' | translate }}</span>
            </div>
          </div>
          <div class="stat-card surface-card">
            <mat-icon class="stat-icon" style="color:#0284c7">location_city</mat-icon>
            <div>
              <span class="stat-value city-value">{{ condoCity }}</span>
              <span class="stat-label text-muted">{{ 'APP.PROVIDER.STATS_CITY' | translate }}</span>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <h2 class="section-title">{{ 'APP.PROVIDER.MY_SERVICES_TITLE' | translate }}</h2>
            <button mat-raised-button color="primary" (click)="openForm()">
              <mat-icon>add</mat-icon>
              {{ 'APP.PROVIDER.ADD_SERVICE' | translate }}
            </button>
          </div>

          @if (isLoadingServices()) {
            <div class="loading-center"><mat-spinner diameter="40" /></div>
          } @else if (services().length === 0) {
            <div class="empty-state surface-card">
              <mat-icon class="empty-icon">storefront</mat-icon>
              <p>{{ 'APP.PROVIDER.NO_SERVICES' | translate }}</p>
              <span class="text-muted">{{ 'APP.PROVIDER.NO_SERVICES_HINT' | translate }}</span>
            </div>
          } @else {
            <div class="services-grid">
              @for (service of services(); track service.id) {
                <mat-card class="service-card surface-card">
                  <mat-card-header>
                    <mat-card-title>{{ service.name }}</mat-card-title>
                    <mat-card-subtitle>{{ service.category }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="service-description text-muted">{{ service.description }}</p>
                    <div class="service-meta">
                      <span class="service-price">{{ service.price }}</span>
                      <span class="text-muted">{{ service.contact }}</span>
                    </div>
                    <div class="chips-row">
                      @for (day of service.availableDays; track day) {
                        <mat-chip>{{ day }}</mat-chip>
                      }
                    </div>
                    <div class="rating-row">
                      @for (i of [1,2,3,4,5]; track i) {
                        <mat-icon class="star-icon" [class.star--filled]="i <= service.rating">star</mat-icon>
                      }
                      <span class="text-muted rating-count">
                        ({{ service.totalReviews }} {{ 'APP.PROVIDER.REVIEWS' | translate }})
                      </span>
                    </div>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-icon-button color="primary" (click)="editService(service)"
                      [matTooltip]="'APP.PROVIDER.EDIT' | translate">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="removeService(service.id)"
                      [matTooltip]="'APP.PROVIDER.REMOVE' | translate">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          }
        </section>

        @if (showForm()) {
          <section class="section form-section">
            <div class="section-header">
              <h2 class="section-title">
                {{ (editingId() ? 'APP.PROVIDER.FORM_EDIT' : 'APP.PROVIDER.FORM_NEW') | translate }}
              </h2>
              <button mat-icon-button (click)="closeForm()"><mat-icon>close</mat-icon></button>
            </div>
            <mat-card class="surface-card--elevated">
              <mat-card-content>
                <form [formGroup]="serviceForm" (ngSubmit)="onSaveService()" class="service-form">
                  <div class="two-col">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>{{ 'APP.PROVIDER.FORM_NAME' | translate }}</mat-label>
                      <input matInput formControlName="name"
                        [placeholder]="'APP.PROVIDER.FORM_NAME_PLACEHOLDER' | translate" />
                      @if (serviceForm.controls.name.touched && serviceForm.controls.name.invalid) {
                        <mat-error>{{ 'APP.PROVIDER.FORM_NAME_REQUIRED' | translate }}</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>{{ 'APP.PROVIDER.FORM_CATEGORY' | translate }}</mat-label>
                      <mat-select formControlName="category">
                        @for (cat of categories; track cat) {
                          <mat-option [value]="cat">{{ cat }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>{{ 'APP.PROVIDER.FORM_DESCRIPTION' | translate }}</mat-label>
                    <textarea matInput formControlName="description" rows="3"
                      [placeholder]="'APP.PROVIDER.FORM_DESCRIPTION_PLACEHOLDER' | translate"></textarea>
                    @if (serviceForm.controls.description.touched && serviceForm.controls.description.invalid) {
                      <mat-error>{{ 'APP.PROVIDER.FORM_DESCRIPTION_REQUIRED' | translate }}</mat-error>
                    }
                  </mat-form-field>
                  <div class="two-col">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>{{ 'APP.PROVIDER.FORM_PRICE' | translate }}</mat-label>
                      <input matInput formControlName="price"
                        [placeholder]="'APP.PROVIDER.FORM_PRICE_PLACEHOLDER' | translate" />
                      @if (serviceForm.controls.price.touched && serviceForm.controls.price.invalid) {
                        <mat-error>{{ 'APP.PROVIDER.FORM_PRICE_REQUIRED' | translate }}</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>{{ 'APP.PROVIDER.FORM_CONTACT' | translate }}</mat-label>
                      <input matInput formControlName="contact"
                        [placeholder]="'APP.PROVIDER.FORM_CONTACT_PLACEHOLDER' | translate" />
                      @if (serviceForm.controls.contact.touched && serviceForm.controls.contact.invalid) {
                        <mat-error>{{ 'APP.PROVIDER.FORM_CONTACT_REQUIRED' | translate }}</mat-error>
                      }
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>{{ 'APP.PROVIDER.FORM_DAYS' | translate }}</mat-label>
                    <mat-select formControlName="availableDays" multiple>
                      @for (day of weekdays; track day) {
                        <mat-option [value]="day">{{ day }}</mat-option>
                      }
                    </mat-select>
                    @if (serviceForm.controls.availableDays.touched && serviceForm.controls.availableDays.invalid) {
                      <mat-error>{{ 'APP.PROVIDER.FORM_DAYS_REQUIRED' | translate }}</mat-error>
                    }
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-stroked-button type="button" (click)="closeForm()">
                      {{ 'APP.PROVIDER.FORM_CANCEL' | translate }}
                    </button>
                    <button mat-raised-button color="primary" type="submit"
                      [disabled]="serviceForm.invalid || isSaving()">
                      @if (isSaving()) { <mat-spinner diameter="18" /> }
                      {{ (editingId() ? 'APP.PROVIDER.FORM_SAVE' : 'APP.PROVIDER.FORM_PUBLISH') | translate }}
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
    .provider-layout { min-height: 100vh; display: flex; flex-direction: column; }
    .provider-main {
      padding: 32px 24px; max-width: 1240px; width: 100%;
      margin: 0 auto; display: flex; flex-direction: column; gap: 32px;
    }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; }
    .stat-icon { font-size: 32px; width: 32px; height: 32px; }
    .stat-value { display: block; font-size: 24px; font-weight: 700; }
    .stat-label { display: block; font-size: 13px; }
    .city-value { font-size: 16px; }
    .section { display: flex; flex-direction: column; gap: 16px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; }
    .section-title { font-size: 18px; font-weight: 700; margin: 0; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 48px; border-radius: 12px; text-align: center;
    }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .service-card { border-radius: 12px !important; }
    .service-description { font-size: 14px; margin: 8px 0; }
    .service-meta { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
    .service-price { font-weight: 700; color: var(--mat-sys-primary); }
    .chips-row { display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; }
    .rating-row { display: flex; align-items: center; gap: 2px; margin-top: 8px; }
    .star-icon { font-size: 16px; width: 16px; height: 16px; color: var(--mat-sys-outline); }
    .star--filled { color: #f59e0b; }
    .rating-count { font-size: 12px; margin-left: 4px; }
    .service-form { display: flex; flex-direction: column; gap: 16px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .form-section { padding-bottom: 40px; }
    @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .two-col { grid-template-columns: 1fr; }
      .provider-main { padding: 16px; gap: 24px; }
      .section-header { flex-direction: column; align-items: stretch; gap: 12px; }
      .section-header > button:not([mat-icon-button]) { width: 100%; }
      .form-actions { flex-direction: column; }
      .form-actions button { width: 100%; }
      .service-meta { flex-direction: column; gap: 4px; }
      .stat-card { padding: 14px; gap: 12px; }
      .stat-value { font-size: 20px; }
      .services-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 400px) {
      .stats-row { grid-template-columns: 1fr; }
    }
  `],
})
export class ProviderDashboardComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);

  readonly weekdays = WEEKDAYS;
  readonly categories = CATEGORIES;

  services = signal<ServiceDto[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  isLoadingServices = signal(false);
  isSaving = signal(false);
  averageRating = signal(0);
  totalReviews = signal(0);

  serviceForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    contact: ['', Validators.required],
    availableDays: [[] as string[], Validators.required],
  });

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || '—';
  }

  constructor() { super({ loadUnit: false }); }

  ngOnInit(): void { this.loadServices(); }

  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.serviceApi.findMine().subscribe({
      next: (list) => {
        this.services.set(list);
        this.recalcStats(list);
        this.isLoadingServices.set(false);
      },
      error: () => this.isLoadingServices.set(false),
    });
  }

  private recalcStats(list: ServiceDto[]): void {
    if (!list.length) { this.averageRating.set(0); this.totalReviews.set(0); return; }
    const total = list.reduce((s, x) => s + x.totalReviews, 0);
    const avg = list.reduce((s, x) => s + x.rating * x.totalReviews, 0) / (total || 1);
    this.totalReviews.set(total);
    this.averageRating.set(Math.round(avg * 10) / 10);
  }

  openForm(): void {
    this.editingId.set(null);
    this.serviceForm.reset({ availableDays: [] });
    this.showForm.set(true);
    setTimeout(() => document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  editService(service: ServiceDto): void {
    this.editingId.set(service.id);
    this.serviceForm.patchValue(service);
    this.showForm.set(true);
    setTimeout(() => document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.serviceForm.reset({ availableDays: [] });
  }

  onSaveService(): void {
    if (this.serviceForm.invalid) return;
    const raw = this.serviceForm.getRawValue();
    const editId = this.editingId();
    this.isSaving.set(true);
    const req = editId
      ? this.serviceApi.update(editId, raw)
      : this.serviceApi.create(raw as CreateServicePayload);
    req.subscribe({
      next: (saved) => {
        this.services.update((list) =>
          editId ? list.map((s) => s.id === editId ? saved : s) : [...list, saved]
        );
        this.recalcStats(this.services());
        this.isSaving.set(false);
        this.closeForm();
      },
      error: () => this.isSaving.set(false),
    });
  }

  removeService(id: string): void {
    this.serviceApi.remove(id).subscribe({
      next: () => {
        this.services.update((list) => list.filter((s) => s.id !== id));
        this.recalcStats(this.services());
      },
    });
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
