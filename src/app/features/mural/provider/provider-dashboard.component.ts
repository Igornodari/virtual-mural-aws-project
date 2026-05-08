import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription, finalize, forkJoin, interval, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';

import BaseComponent from 'src/app/components/base.component';

import {
  AppointmentApiService,
  AppointmentDto,
} from 'src/app/core/services/appointment-api.service';

import { OnboardingService } from 'src/app/core/services/onboarding.service';

import {
  ServiceApiService,
  ServiceDto,
} from 'src/app/core/services/service-api.service';

import {
  StripeConnectApiService,
  StripeConnectStatusResponse,
} from 'src/app/core/services/stripe-connect-api.service';

import { importBase } from 'src/app/shared/constant/import-base.constant';
import { CATEGORIES } from 'src/app/shared/types/provider.types';
import { AvailabilitySlot } from 'src/app/shared/types/availability.types';

import { ServiceAnalyticsComponent } from './analytics/service-analytics.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { WeeklyAvailabilityPickerComponent } from 'src/app/shared/components/weekly-availability-picker/weekly-availability-picker.component';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    ...importBase,
    ServiceAnalyticsComponent,
    ServiceCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    WeeklyAvailabilityPickerComponent,
  ],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss'],
})
export class ProviderDashboardComponent extends BaseComponent implements OnInit, OnDestroy {
  private refreshSub: Subscription | null = null;
  private readonly REFRESH_INTERVAL_MS = 30_000;

  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly stripeConnectApi = inject(StripeConnectApiService);

  readonly categories = CATEGORIES;

  readonly services = signal<ServiceDto[]>([]);
  readonly showForm = signal(false);
  readonly selectedAnalyticsService = signal<ServiceDto | null>(null);
  readonly editingId = signal<string | null>(null);

  readonly isLoadingServices = signal(false);
  readonly isSaving = signal(false);

  readonly averageRating = signal(0);
  readonly totalReviews = signal(0);
  readonly pendingAppointments = signal(0);

  // ── Stripe Connect ────────────────────────────────────────────────────────
  readonly stripeStatus = signal<StripeConnectStatusResponse | null>(null);
  readonly isLoadingStripe = signal(false);
  readonly isConnectingStripe = signal(false);
  readonly stripeConnectSuccessMessage = signal<string | null>(null);

  readonly serviceForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    contact: ['', Validators.required],
    availableDays: this.fb.nonNullable.control<string[]>([], Validators.required),
  });

  availabilitySlots: AvailabilitySlot[] = [];

  get condoCity(): string {
    return this.onboardingService.profile.condominiumAddress?.city || '-';
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadStripeStatus();
    this.handleStripeConnectReturn();
    this.startAutoRefreshPendingAppointments();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);

    this.serviceApi
      .findMine()
      .pipe(
        catchError(() => of([] as ServiceDto[])),
        finalize(() => this.isLoadingServices.set(false)),
      )
      .subscribe({
        next: (list) => {
          this.services.set(list);
          this.recalcStats(list);
          this.refreshPendingAppointmentsForServices(list);
        },
      });
  }

  private startAutoRefreshPendingAppointments(): void {
    this.refreshSub = interval(this.REFRESH_INTERVAL_MS).subscribe(() => {
      this.refreshPendingAppointmentsForServices(this.services());
    });
  }

  private refreshPendingAppointmentsForServices(services: ServiceDto[]): void {
    if (!services.length) {
      this.pendingAppointments.set(0);
      return;
    }

    forkJoin(
      services.map((service) =>
        this.appointmentApi
          .findByService(service.id)
          .pipe(catchError(() => of([] as AppointmentDto[]))),
      ),
    ).subscribe({
      next: (appointmentsByService) => {
        const appointments = appointmentsByService
          .filter((result): result is AppointmentDto[] => Array.isArray(result))
          .flat();

        this.pendingAppointments.set(
          appointments.filter((appointment) => appointment.status === 'pending').length,
        );
      },
    });
  }

  private recalcStats(list: ServiceDto[]): void {
    if (!list.length) {
      this.averageRating.set(0);
      this.totalReviews.set(0);
      return;
    }

    const totalReviews = list.reduce(
      (sum, item) => sum + (item.totalReviews || 0),
      0,
    );

    const weightedAverage =
      list.reduce(
        (sum, item) => sum + (item.rating || 0) * (item.totalReviews || 0),
        0,
      ) / (totalReviews || 1);

    this.totalReviews.set(totalReviews);
    this.averageRating.set(Math.round(weightedAverage * 10) / 10);
  }

  openForm(): void {
    this.editingId.set(null);
    this.availabilitySlots = [];

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

    this.availabilitySlots = service.availabilitySlots?.length
      ? service.availabilitySlots
      : (service.availableDays ?? []).map((day) => ({
          day,
          startTime: '09:00',
          endTime: '18:00',
        }));

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
    this.availabilitySlots = [];

    this.serviceForm.reset({
      name: '',
      category: '',
      description: '',
      price: '',
      contact: '',
      availableDays: [],
    });
  }

  onAvailabilitySlotsChange(slots: AvailabilitySlot[]): void {
    this.availabilitySlots = slots;

    this.serviceForm.controls.availableDays.setValue(
      slots.map((slot) => slot.day),
    );
  }

  onSaveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const rawValue = this.serviceForm.getRawValue();

    const payload = {
      ...rawValue,
      availabilitySlots: this.availabilitySlots.length
        ? this.availabilitySlots
        : undefined,
    };

    const currentEditingId = this.editingId();

    this.isSaving.set(true);

    const request$ = currentEditingId
      ? this.serviceApi.update(currentEditingId, payload)
      : this.serviceApi.create(payload);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (savedService) => {
          this.services.update((currentList) =>
            currentEditingId
              ? currentList.map((item) =>
                  item.id === currentEditingId ? savedService : item,
                )
              : [...currentList, savedService],
          );

          this.recalcStats(this.services());
          this.refreshPendingAppointmentsForServices(this.services());
          this.closeForm();
        },
      });
  }

  removeService(serviceId: string): void {
    this.serviceApi.remove(serviceId).subscribe({
      next: () => {
        this.services.update((list) =>
          list.filter((service) => service.id !== serviceId),
        );

        this.recalcStats(this.services());
        this.refreshPendingAppointmentsForServices(this.services());
      },
    });
  }

  private handleStripeConnectReturn(): void {
    const param = this.route.snapshot.queryParamMap.get('stripe_connect');

    if (param === 'success') {
      this.stripeConnectSuccessMessage.set(
        'PAYMENT.STRIPE_CONNECT.RETURN_SUCCESS',
      );

      window.history.replaceState({}, '', '/mural/provider');

      setTimeout(() => this.loadStripeStatus(), 1500);
      return;
    }

    if (param === 'refresh') {
      this.stripeConnectSuccessMessage.set(
        'PAYMENT.STRIPE_CONNECT.RETURN_REFRESH',
      );

      window.history.replaceState({}, '', '/mural/provider');

      setTimeout(() => this.loadStripeStatus(), 1500);
    }
  }

  private loadStripeStatus(): void {
    this.isLoadingStripe.set(true);

    this.stripeConnectApi
      .getStatus()
      .pipe(finalize(() => this.isLoadingStripe.set(false)))
      .subscribe({
        next: (status) => this.stripeStatus.set(status),
        error: () => this.stripeStatus.set(null),
      });
  }

  connectStripe(): void {
    this.isConnectingStripe.set(true);

    const status = this.stripeStatus();

    const request$ = status?.accountId
      ? this.stripeConnectApi.createOnboardingLink()
      : this.stripeConnectApi.createOrGetAccount();

    request$
      .pipe(finalize(() => this.isConnectingStripe.set(false)))
      .subscribe({
        next: (res) => {
          window.location.href = res.onboardingUrl;
        },
      });
  }

  openStripeDashboard(): void {
    this.isConnectingStripe.set(true);

    this.stripeConnectApi
      .createDashboardLink()
      .pipe(finalize(() => this.isConnectingStripe.set(false)))
      .subscribe({
        next: (res) => window.open(res.url, '_blank'),
      });
  }

  private scrollToForm(): void {
    setTimeout(() => {
      document
        .querySelector('.service-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}
