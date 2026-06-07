import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core';


import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import {
  AppointmentApiService,
  AppointmentDto,
  BlockedSlot,
  CreateAppointmentPayload,
  ServiceAvailabilityDto,
} from 'src/app/core/services/appointment-api.service';
import {
  AnonymousReviewDto,
  CreateReviewPayload,
  ReviewApiService,
} from 'src/app/core/services/review-api.service';
import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { RatingStarsComponent } from 'src/app/shared/components/rating-stars/rating-stars.component';
import { isBlockingAppointmentStatus } from 'src/app/shared/utils/appointment-status.util';
import { CUSTOMER_STARS } from '../../customer.constants';
import { RatingLabelPipe } from '../../pipes/rating-label.pipe';
import {
  AppointmentCalendarPickerComponent,
  CalendarSelection,
} from 'src/app/shared/components/appointment-calendar-picker/appointment-calendar-picker.component';
import { AvailabilitySlot } from 'src/app/shared/types/availability.types';
type ApiBlockedSlot = {
  date?: string | Date;
  time?: string | null;
  scheduledDate?: string | Date;
  scheduledTime?: string | null;
};

@Component({
  selector: 'app-customer-service-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslateModule,
    RatingLabelPipe,
    RatingStarsComponent,
    AppointmentCalendarPickerComponent,
  ],
  templateUrl: './customer-service-details.component.html',
  styleUrls: ['./customer-service-details.component.scss'],
})
export class CustomerServiceDetailsComponent implements OnChanges {
  private readonly destroyRef = inject(DestroyRef);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly reviewApi = inject(ReviewApiService);
  private readonly onboardingService = inject(OnboardingService);

  @Input({ required: true }) service!: ServiceDto;

  @Output() appointmentCreated = new EventEmitter<AppointmentDto>();
  @Output() serviceUpdated = new EventEmitter<ServiceDto>();

  readonly stars = CUSTOMER_STARS;
  private readonly cdr = inject(ChangeDetectorRef);
  private viewDestroyed = false;

  reviews: AnonymousReviewDto[] = [];
  blockedSlots: BlockedSlot[] = [];
  availabilitySlots: AvailabilitySlot[] = [];
  calendarSelection: CalendarSelection | null = null;
  hoverRating = 0;
  pendingRating = 0;
  pendingComment = '';
  isLoadingReviews = false;
  isScheduling = false;
  isReviewing = false;

  /**
   * Id do usuário autenticado conforme o banco (não confundir com
   * `AuthService.user.id`, que armazena o Cognito sub). Usamos esse
   * id pra detectar se o serviço atual pertence ao usuário e bloquear
   * o agendamento de auto-atendimento.
   */
  private currentDbUserId: string | null = null;

  /** Verdadeiro quando o serviço aberto pertence ao usuário autenticado. */
  get isOwnService(): boolean {
    return (
      !!this.currentDbUserId && this.service?.providerId === this.currentDbUserId
    );
  }

  private activeServiceId: string | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.viewDestroyed = true;
    });

    // Carrega o id do usuário no banco uma vez por sessão do componente.
    // Não usamos AuthService.user.id porque ele é o Cognito sub.
    this.onboardingService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (me) => {
          this.currentDbUserId = me?.id ?? null;
          this.cdr.markForCheck();
        },
      });
  }


  ngOnChanges(): void {
    if (!this.service?.id) {
      return;
    }

    const isNewService = this.service.id !== this.activeServiceId;

    // Carrega reviews/availability APENAS quando o servico realmente muda.
    // Antes loadAvailability rodava todo ngOnChanges e isso causava
    // re-renders do picker em cada CD do parent.
    if (isNewService) {
      this.activeServiceId = this.service.id;
      this.resetState();
      this.trackExpansion();
      this.loadReviews();
      this.loadAvailability();
    }
  }




  private deferStateChange(callback: () => void): void {
    queueMicrotask(() => {
      if (this.viewDestroyed) {
        return;
      }

      callback();
      this.cdr.detectChanges();
    });
  }

  private toDateKey(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    return String(value).substring(0, 10);
  }

  private normalizeBlockedSlot(slot: ApiBlockedSlot): BlockedSlot | null {
    const date = this.toDateKey(slot.date ?? slot.scheduledDate);
    const time = slot.time ?? slot.scheduledTime ?? null;

    if (!date) {
      return null;
    }

    return {
      date,
      time,
    };
  }


  private normalizeAvailabilityBlockedSlots(
    availability: ServiceAvailabilityDto & { blockedDates?: string[] },
  ): BlockedSlot[] {
    const blockedByTime = (availability.blockedSlots ?? [])
      .map((slot) => this.normalizeBlockedSlot(slot as ApiBlockedSlot))
      .filter((slot): slot is BlockedSlot => !!slot);

    const blockedFullDays = (availability.blockedDates ?? [])
      .map((date) => ({
        date: this.toDateKey(date),
        time: null,
      }))
      .filter((slot) => !!slot.date);

    return [...blockedByTime, ...blockedFullDays];
  }

  onCalendarSelectionChange(selection: CalendarSelection): void {
    this.deferStateChange(() => {
      this.calendarSelection = selection;
    });
  }

  setPendingComment(comment: string): void {
    this.pendingComment = comment;
  }

  schedule(): void {
    const selection = this.calendarSelection;

    if (!selection) {
      return;
    }

    // Bloqueio defensivo de UI — o backend também rejeita, mas evitamos
    // a viagem desnecessária e damos feedback imediato no caso raro de o
    // botão ter sido renderizado antes da resposta de getMe().
    if (this.isOwnService) {
      return;
    }

    const serviceId = this.service.id;
    this.isScheduling = true;

    const payload: CreateAppointmentPayload = {
      serviceId,
      scheduledDate: this.toDateKey(selection.date),
       scheduledDay: selection.day,
      scheduledTime: selection.time,
      notes:
        'Agendamento solicitado pelo mural para ' +
        selection.day +
        ' as ' +
        selection.time +
        '.',
    };

    this.appointmentApi
      .create(payload)
      .pipe(
        finalize(() => {
          this.isScheduling = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (appointment) => {
          if (this.activeServiceId !== serviceId) {
            return;
          }

          this.appointmentCreated.emit(appointment);
        },
      });
  }
  submitReview(): void {
    const rating = this.pendingRating;

    if (!rating) {
      return;
    }

    const serviceId = this.service.id;
    const comment = this.pendingComment.trim();
    this.isReviewing = true;

    const payload: CreateReviewPayload = {
      serviceId,
      rating,
      comment: comment || undefined,
    };

    this.reviewApi
      .create(payload)
      .pipe(
        finalize(() => (this.isReviewing = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (newReview) => {
          if (this.activeServiceId !== serviceId) {
            return;
          }

          this.deferStateChange(() => {
            this.pendingRating = 0;
            this.hoverRating = 0;
            this.pendingComment = '';
            this.reviews = [newReview, ...this.reviews];
          });

          this.refreshService(serviceId);
        },
      });
  }

  private resetState(): void {
    this.reviews = [];
    this.blockedSlots = [];
    this.availabilitySlots = [];
    this.calendarSelection = null;
    this.hoverRating = 0;
    this.pendingRating = 0;
    this.pendingComment = '';
    this.isLoadingReviews = false;
    this.isScheduling = false;
    this.isReviewing = false;
  }

  private trackExpansion(): void {
    this.serviceApi
      .trackMetric(this.service.id, 'clicks')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private loadReviews(): void {
    const serviceId = this.service.id;
    this.isLoadingReviews = true;

    this.reviewApi
      .findByService(serviceId)
      .pipe(
        finalize(() => {
          if (this.activeServiceId === serviceId) {
            this.deferStateChange(() => {
              this.isLoadingReviews = false;
            });
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (reviews) => {
          if (this.activeServiceId === serviceId) {
            this.deferStateChange(() => {
              this.reviews = Array.isArray(reviews) ? reviews : [];
            });
          }
        },
      });
  }

  private loadAvailability(): void {
    const serviceId = this.service.id;

    const nextAvailabilitySlots = this.service.availabilitySlots?.length
      ? this.service.availabilitySlots
      : (this.service.availableDays ?? []).map((day) => ({
        day,
        startTime: '09:00',
        endTime: '18:00',
      }));

    this.deferStateChange(() => {
      this.availabilitySlots = nextAvailabilitySlots;
    });

    this.appointmentApi
      .findByService(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (this.activeServiceId !== serviceId) {
            return;
          }

          this.deferStateChange(() => {
            if (Array.isArray(response)) {
              this.blockedSlots = response
                .filter((a) => isBlockingAppointmentStatus(a.status))
                .map((a) => ({
                  date: String(a.scheduledDate).substring(0, 10),
                  time: a.scheduledTime ?? null,
                }));

              return;
            }

            const availability = response as ServiceAvailabilityDto & {
              blockedDates?: string[];
            };

            this.blockedSlots = this.normalizeAvailabilityBlockedSlots(availability);
          });
        },
        error: () => {
          if (this.activeServiceId === serviceId) {
            this.deferStateChange(() => {
              this.blockedSlots = [];
            });
          }
        },
      });
  }

  private refreshService(serviceId: string): void {
    this.serviceApi
      .findOne(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedService) => this.serviceUpdated.emit(updatedService),
      });
  }


}
