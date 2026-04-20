import { CommonModule } from '@angular/common';
import {
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
  CreateAppointmentPayload,
} from 'src/app/core/services/appointment-api.service';
import {
  AnonymousReviewDto,
  CreateReviewPayload,
  ReviewApiService,
} from 'src/app/core/services/review-api.service';
import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import { RatingStarsComponent } from 'src/app/shared/components/rating-stars/rating-stars.component';
import { isBlockingAppointmentStatus } from 'src/app/shared/utils/appointment-status.util';
import { CUSTOMER_STARS } from '../../customer.constants';
import { RatingLabelPipe } from '../../pipes/rating-label.pipe';
import {
  AppointmentCalendarPickerComponent,
  CalendarSelection,
} from 'src/app/shared/components/appointment-calendar-picker/appointment-calendar-picker.component';
import { AvailabilitySlot, WEEKDAY_NAME_BY_JS_INDEX } from 'src/app/shared/types/availability.types';

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

  @Input({ required: true }) service!: ServiceDto;

  @Output() appointmentCreated = new EventEmitter<AppointmentDto>();
  @Output() serviceUpdated = new EventEmitter<ServiceDto>();

  readonly stars = CUSTOMER_STARS;

  reviews: AnonymousReviewDto[] = [];
  blockedDates: string[] = [];
  availabilitySlots: AvailabilitySlot[] = [];
  calendarSelection: CalendarSelection | null = null;
  hoverRating = 0;
  pendingRating = 0;
  pendingComment = '';
  isLoadingReviews = false;
  isScheduling = false;
  isReviewing = false;

  private activeServiceId: string | null = null;

  ngOnChanges(): void {
    if (!this.service?.id || this.service.id === this.activeServiceId) {
      return;
    }

    this.activeServiceId = this.service.id;
    this.resetState();
    this.trackExpansion();
    this.loadReviews();
    this.loadAvailability();
  }

  onCalendarSelectionChange(selection: CalendarSelection): void {
    this.calendarSelection = selection;
  }

  setPendingComment(comment: string): void {
    this.pendingComment = comment;
  }

  schedule(): void {
    const selection = this.calendarSelection;

    if (!selection) {
      return;
    }

    const serviceId = this.service.id;
    this.isScheduling = true;

    const payload: CreateAppointmentPayload = {
      serviceId,
      scheduledDate: selection.date,
      scheduledDay: selection.day,
      scheduledTime: selection.time,
      notes: `Agendamento solicitado pelo mural para ${selection.day} às ${selection.time}.`,
    };

    this.appointmentApi
      .create(payload)
      .pipe(
        finalize(() => (this.isScheduling = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (appointment) => {
          if (this.activeServiceId !== serviceId) {
            return;
          }

          this.calendarSelection = null;
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

          this.pendingRating = 0;
          this.hoverRating = 0;
          this.pendingComment = '';
          this.reviews = [newReview, ...this.reviews];
          this.refreshService(serviceId);
        },
      });
  }

  private resetState(): void {
    this.reviews = [];
    this.blockedDates = [];
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
            this.isLoadingReviews = false;
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (reviews) => {
          if (this.activeServiceId === serviceId) {
            this.reviews = Array.isArray(reviews) ? reviews : [];
          }
        },
      });
  }

  private loadAvailability(): void {
    const serviceId = this.service.id;

    // Carrega slots de disponibilidade do serviço
    this.availabilitySlots = this.service.availabilitySlots?.length
      ? this.service.availabilitySlots
      : (this.service.availableDays ?? []).map((day) => ({
          day,
          startTime: '09:00',
          endTime: '18:00',
        }));

    // Carrega datas bloqueadas (agendamentos ativos)
    this.appointmentApi
      .findByService(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointments) => {
          if (this.activeServiceId !== serviceId) {
            return;
          }

          const list = Array.isArray(appointments) ? appointments : [];
          this.blockedDates = list
            .filter((appointment) => isBlockingAppointmentStatus(appointment.status))
            .map((appointment) => appointment.scheduledDate);
        },
        error: () => {
          if (this.activeServiceId === serviceId) {
            this.blockedDates = [];
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

