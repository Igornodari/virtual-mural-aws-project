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
import {
  BLOCKING_APPOINTMENT_STATUSES,
  CUSTOMER_STARS,
  WEEKDAY_INDEX_BY_LABEL,
} from '../../customer.constants';
import { RatingLabelPipe } from '../../pipes/rating-label.pipe';
import { CustomerRatingStarsComponent } from '../customer-rating-stars/customer-rating-stars.component';

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
    CustomerRatingStarsComponent,
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
  blockedDays: string[] = [];
  selectedDay: string | null = null;
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

  isDayUnavailable(day: string): boolean {
    return this.blockedDays.includes(day);
  }

  selectDay(day: string): void {
    if (this.isDayUnavailable(day)) {
      return;
    }

    this.selectedDay = this.selectedDay === day ? null : day;
  }

  setPendingComment(comment: string): void {
    this.pendingComment = comment;
  }

  schedule(): void {
    const day = this.selectedDay;

    if (!day || this.isDayUnavailable(day)) {
      return;
    }

    const serviceId = this.service.id;
    this.isScheduling = true;

    const payload: CreateAppointmentPayload = {
      serviceId,
      scheduledDate: this.resolveNextDateForDay(day),
      scheduledDay: day,
      notes: `Agendamento solicitado pelo mural para ${day}.`,
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

          this.selectedDay = null;
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
    this.blockedDays = [];
    this.selectedDay = null;
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

    this.appointmentApi
      .findByService(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointments) => {
          if (this.activeServiceId !== serviceId) {
            return;
          }

          const list = Array.isArray(appointments) ? appointments : [];
          this.blockedDays = list
            .filter((appointment) => BLOCKING_APPOINTMENT_STATUSES.includes(appointment.status))
            .map((appointment) => appointment.scheduledDay);
        },
        error: (err) => {
          console.error('Erro ao carregar disponibilidade:', err);

          if (this.activeServiceId === serviceId) {
            this.blockedDays = [];
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

  private resolveNextDateForDay(day: string): string {
    const targetDay = WEEKDAY_INDEX_BY_LABEL[day] ?? new Date().getDay();
    const currentDate = new Date();
    const diff = (targetDay - currentDate.getDay() + 7) % 7 || 7;

    currentDate.setDate(currentDate.getDate() + diff);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${date}`;
  }
}
