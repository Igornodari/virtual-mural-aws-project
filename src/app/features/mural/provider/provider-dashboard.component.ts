import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { FormBuilder, Validators } from '@angular/forms';
import { AppointmentApiService, AppointmentDto, AppointmentStatus } from 'src/app/core/services/appointment-api.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { CreateServicePayload, ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';

import BaseComponent from 'src/app/components/base.component';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { WEEKDAYS, CATEGORIES } from 'src/app/shared/types/provider.types';
import { ServiceAnalyticsComponent } from './analytics/service-analytics.component';

@Component({
  selector: 'app-provider-dashboard',
  imports: [...importBase, ServiceAnalyticsComponent, MuralTopbarComponent],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss'],
})
export class ProviderDashboardComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);

  readonly weekdays = WEEKDAYS;
  readonly categories = CATEGORIES;

  readonly services = signal<ServiceDto[]>([]);
  readonly appointments = signal<AppointmentDto[]>([]);
  readonly showForm = signal(false);
  readonly selectedAnalyticsService = signal<ServiceDto | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly isLoadingServices = signal(false);
  readonly isLoadingAppointments = signal(false);
  readonly isSaving = signal(false);
  readonly averageRating = signal(0);
  readonly totalReviews = signal(0);
  readonly pendingAppointments = signal(0);
  readonly isUpdatingAppointment = signal<string | null>(null);

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
