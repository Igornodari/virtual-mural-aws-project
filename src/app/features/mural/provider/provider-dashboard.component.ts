import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription, finalize, forkJoin, interval } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { FormBuilder, Validators } from '@angular/forms';
import {
  AppointmentApiService,
  AppointmentDto,
  AppointmentStatus,
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

import BaseComponent from 'src/app/components/base.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { CATEGORIES } from 'src/app/shared/types/provider.types';
import { AvailabilitySlot } from 'src/app/shared/types/availability.types';
import { ServiceAnalyticsComponent } from './analytics/service-analytics.component';
import { ServiceCardComponent } from 'src/app/shared/components/service-card/service-card.component';
import { StatusBadgeComponent } from 'src/app/shared/components/status-badge/status-badge.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatDialogComponent } from 'src/app/shared/components/chat-dialog/chat-dialog.component';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { WeeklyAvailabilityPickerComponent } from 'src/app/shared/components/weekly-availability-picker/weekly-availability-picker.component';
import { AppointmentKanbanComponent } from './components/appointment-kanban/appointment-kanban.component';
import {
  canCancelAppointment,
  canCompleteAppointment,
  canConfirmAppointment,
} from 'src/app/shared/utils/appointment-status.util';

@Component({
  selector: 'app-provider-dashboard',
  imports: [
    ...importBase,
    ServiceAnalyticsComponent,
    ServiceCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    WeeklyAvailabilityPickerComponent,
    AppointmentKanbanComponent,
  ],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss'],
})
export class ProviderDashboardComponent extends BaseComponent implements OnInit, OnDestroy {
  private refreshSub: Subscription | null = null;
  private readonly REFRESH_INTERVAL_MS = 30_000; // 30 segundos
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly dialog = inject(MatDialog);
  private readonly stripeConnectApi = inject(StripeConnectApiService);
  private readonly route = inject(ActivatedRoute);

  readonly categories = CATEGORIES;

  /** Controla qual view está ativa no painel: lista de agendamentos ou kanban */
  readonly appointmentsView = signal<'list' | 'kanban'>('kanban');

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

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadStripeStatus();
    this.handleStripeConnectReturn();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  private startAutoRefresh(): void {
    this.refreshSub = interval(this.REFRESH_INTERVAL_MS).subscribe(() => {
      // Silently refresh appointments without showing loading spinner
      const currentServices = this.services();
      if (!currentServices.length) return;
      forkJoin(currentServices.map((s) => this.appointmentApi.findByService(s.id))).subscribe({
        next: (byService) => {
          const fresh = byService
            .flat()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          this.appointments.set(fresh);
          this.pendingAppointments.set(fresh.filter((a) => a.status === 'pending').length);
        },
      });
    });
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);

    this.serviceApi.findMine().pipe(
      finalize(() => this.isLoadingServices.set(false)),
    ).subscribe({
      next: (list) => {
        this.services.set(list);
        this.recalcStats(list);
        this.loadAppointmentsForServices(list);
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

    forkJoin(services.map((service) => this.appointmentApi.findByService(service.id))).pipe(
      finalize(() => this.isLoadingAppointments.set(false)),
    ).subscribe({
      next: (appointmentsByService) => {
        const appointments = appointmentsByService
          .flat()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        this.appointments.set(appointments);
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

    const totalReviews = list.reduce((sum, item) => sum + item.totalReviews, 0);
    const weightedAverage =
      list.reduce((sum, item) => sum + item.rating * item.totalReviews, 0) / (totalReviews || 1);

    this.totalReviews.set(totalReviews);
    this.averageRating.set(Math.round(weightedAverage * 10) / 10);
  }

  canConfirm(appointment: AppointmentDto): boolean {
    return canConfirmAppointment(appointment);
  }

  canCancel(appointment: AppointmentDto): boolean {
    return canCancelAppointment(appointment);
  }

  canComplete(appointment: AppointmentDto): boolean {
    return canCompleteAppointment(appointment);
  }

  updateAppointmentStatus(appointment: AppointmentDto, status: AppointmentStatus): void {
    this.isUpdatingAppointment.set(appointment.id);

    this.appointmentApi.updateStatus(appointment.id, status).pipe(
      finalize(() => this.isUpdatingAppointment.set(null)),
    ).subscribe({
      next: (updatedAppointment) => {
        this.appointments.update((currentAppointments) =>
          currentAppointments.map((currentAppointment) =>
            currentAppointment.id === updatedAppointment.id
              ? updatedAppointment
              : currentAppointment,
          ),
        );
        this.pendingAppointments.set(
          this.appointments().filter(
            (currentAppointment) => currentAppointment.status === 'pending',
          ).length,
        );
      },
    });
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

    // Restaura availability slots ou converte de availableDays (retrocompat)
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
    // Sincroniza availableDays no form para manter validação
    this.serviceForm.controls.availableDays.setValue(slots.map((s) => s.day));
  }

  onSaveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const rawValue = this.serviceForm.getRawValue();
    const payload = {
      ...rawValue,
      availabilitySlots: this.availabilitySlots.length ? this.availabilitySlots : undefined,
    };
    const currentEditingId = this.editingId();

    this.isSaving.set(true);

    const request$ = currentEditingId
      ? this.serviceApi.update(currentEditingId, payload)
      : this.serviceApi.create(payload);

    request$.pipe(
      finalize(() => this.isSaving.set(false)),
    ).subscribe({
      next: (savedService) => {
        this.services.update((currentList) =>
          currentEditingId
            ? currentList.map((item) => (item.id === currentEditingId ? savedService : item))
            : [...currentList, savedService],
        );

        this.recalcStats(this.services());
        this.closeForm();
        this.loadAppointmentsForServices(this.services());
      },
    });
  }

  // ── Stripe Connect methods ─────────────────────────────────────────────────

  private handleStripeConnectReturn(): void {
    const param = this.route.snapshot.queryParamMap.get('stripe_connect');
    if (param === 'success') {
      this.stripeConnectSuccessMessage.set('APP.STRIPE_CONNECT.RETURN_SUCCESS');
      // Limpa o query param da URL sem recarregar
      window.history.replaceState({}, '', '/mural/provider');
    } else if (param === 'refresh') {
      this.stripeConnectSuccessMessage.set('APP.STRIPE_CONNECT.RETURN_REFRESH');
      window.history.replaceState({}, '', '/mural/provider');
    }
  }

  private loadStripeStatus(): void {
    this.isLoadingStripe.set(true);
    this.stripeConnectApi.getStatus().pipe(
      finalize(() => this.isLoadingStripe.set(false)),
    ).subscribe({
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

    request$.pipe(
      finalize(() => this.isConnectingStripe.set(false)),
    ).subscribe({
      next: (res) => {
        window.location.href = res.onboardingUrl;
      },
    });
  }

  openStripeDashboard(): void {
    this.isConnectingStripe.set(true);
    this.stripeConnectApi.createDashboardLink().pipe(
      finalize(() => this.isConnectingStripe.set(false)),
    ).subscribe({
      next: (res) => window.open(res.url, '_blank'),
    })