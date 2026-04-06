import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { FormBuilder, Validators } from '@angular/forms';
import { AppointmentApiService, AppointmentDto, AppointmentStatus } from 'src/app/core/services/appointment-api.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { CreateServicePayload, ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';

import BaseComponent from 'src/app/components/base.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { WEEKDAYS, CATEGORIES } from 'src/app/shared/types/provider.types';
import { ServiceAnalyticsComponent } from './analytics/service-analytics.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { StatusBadgeComponent } from 'src/app/shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-provider-dashboard',
  imports: [
    ...importBase,
    ServiceAnalyticsComponent,
    ServiceCardComponent,
    StatusBadgeComponent
  ],
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

  readonly serviceForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    contact: ['', Validators.required],
    availableDays: this.fb.nonNullable.control<string[]>([], Validators.required),
  });

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || '-';
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);

    this.serviceApi.findMine().subscribe({
      next: (list) => {
        this.services.set(list);
        this.recalcStats(list);
        this.isLoadingServices.set(false);
        this.loadAppointmentsForServices(list);
      },
      error: () => {
        this.isLoadingServices.set(false);
      },
    });
  }

  private loadAppointmentsForServices(services: ServiceDto[]): void {
    if (!services.length) {
      this.appointments.set([]);
      this.pendingAppointments.set(0);
      return;
    }

    this.isLoadingAppointments.set(true);

    forkJoin(
      services.map((service) =>
        this.appointmentApi.findByService(service.id),
      ),
    ).subscribe({
      next: (appointmentsByService) => {
        const appointments = appointmentsByService
          .flat()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        this.appointments.set(appointments);
        this.pendingAppointments.set(
          appointments.filter((appointment) => appointment.status === 'pending').length,
        );
        this.isLoadingAppointments.set(false);
      },
      error: () => {
        this.isLoadingAppointments.set(false);
      },
    });
  }

  private recalcStats(list: ServiceDto[]): void {
    if (!list.length) {
      this.averageRating.set(0);
      this.totalReviews.set(0);
      return;
    }

    const totalReviews = list.reduce((sum, item) => sum + item.totalReviews, 0);
    const weightedAverage =
      list.reduce((sum, item) => sum + item.rating * item.totalReviews, 0) / (totalReviews || 1);

    this.totalReviews.set(totalReviews);
    this.averageRating.set(Math.round(weightedAverage * 10) / 10);
  }



  canConfirm(appointment: AppointmentDto): boolean {
    return appointment.status === 'pending';
  }

  canCancel(appointment: AppointmentDto): boolean {
    return appointment.status === 'pending' || appointment.status === 'confirmed';
  }

  canComplete(appointment: AppointmentDto): boolean {
    return appointment.status === 'paid';
  }

  updateAppointmentStatus(appointment: AppointmentDto, status: AppointmentStatus): void {
    this.isUpdatingAppointment.set(appointment.id);

    this.appointmentApi.updateStatus(appointment.id, status).subscribe({
      next: (updatedAppointment) => {
        this.appointments.update((currentAppointments) =>
          currentAppointments.map((currentAppointment) =>
            currentAppointment.id === updatedAppointment.id ? updatedAppointment : currentAppointment,
          ),
        );
        this.pendingAppointments.set(
          this.appointments().filter((currentAppointment) => currentAppointment.status === 'pending').length,
        );
        this.isUpdatingAppointment.set(null);
      },
      error: () => {
        this.isUpdatingAppointment.set(null);
      },
    });
  }

  openForm(): void {
    this.editingId.set(null);
    this.serviceForm.reset({
      name: '',
      category: '',
      description: '',
      price: '',
      contact: '',
      availableDays: [],
    });
    this.showForm.set(true);
    this.scrollToForm();
  }

  editService(service: ServiceDto): void {
    this.editingId.set(service.id);
    this.serviceForm.patchValue({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      contact: service.contact,
      availableDays: service.availableDays ?? [],
    });
    this.showForm.set(true);
    this.scrollToForm();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.serviceForm.reset({
      name: '',
      category: '',
      description: '',
      price: '',
      contact: '',
      availableDays: [],
    });
  }

  onSaveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const payload = this.serviceForm.getRawValue();
    const currentEditingId = this.editingId();

    this.isSaving.set(true);

    const request$ = currentEditingId
      ? this.serviceApi.update(currentEditingId, payload)
      : this.serviceApi.create(payload as CreateServicePayload);

    request$.subscribe({
      next: (savedService) => {
        this.services.update((currentList) =>
          currentEditingId
            ? currentList.map((item) => (item.id === currentEditingId ? savedService : item))
            : [...currentList, savedService],
        );

        this.recalcStats(this.services());
        this.isSaving.set(false);
        this.closeForm();
        this.loadAppointmentsForServices(this.services());
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  removeService(id: string): void {
    this.serviceApi.remove(id).subscribe({
      next: () => {
        this.services.update((currentList) => currentList.filter((item) => item.id !== id));

        if (this.selectedAnalyticsService()?.id === id) {
          this.selectedAnalyticsService.set(null);
        }

        this.recalcStats(this.services());
        this.loadAppointmentsForServices(this.services());
      },
    });
  }

  private scrollToForm(): void {
    setTimeout(() => {
      document.querySelector('.form-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

}
