import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import {
  AvailabilitySlot,
  WEEKDAY_NAME_BY_JS_INDEX,
  generateTimeSlots,
  formatDateToISO,
} from '../../types/availability.types';

export interface CalendarSelection {
  date: string; // YYYY-MM-DD
  day: string; // 'Segunda-feira'
  time: string; // 'HH:mm'
}

@Component({
  selector: 'app-appointment-calendar-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  template: `
    <div class="calendar-picker d-flex flex-col gap-20">
      <div class="calendar-wrapper">
        <mat-calendar
          [minDate]="minDate"
          [dateFilter]="dateFilter"
          [selected]="selectedDate"
          (selectedChange)="onDateSelected($event)"
        />
      </div>

      @if (selectedDate && timeSlots.length > 0) {
        <div class="time-slots-section d-flex flex-col gap-10">
          <p class="time-slots-label d-flex align-items-center gap-5 m-0">
            <mat-icon
              class="text-primary"
              style="font-size:18px;width:18px;height:18px;"
            >
              schedule
            </mat-icon>

            {{ 'MURAL.SCHEDULE.SELECT_TIME' | translate }}

            <strong>{{ selectedDate | date: 'dd/MM' }}</strong>
          </p>

          <div class="time-slots-grid">
            @for (slot of timeSlots; track slot) {
              <button
                type="button"
                class="time-slot-btn"
                [class.time-slot-btn--active]="selectedTime === slot"
                (click)="selectTime(slot)"
              >
                {{ slot }}
              </button>
            }
          </div>
        </div>
      }

      @if (selectedDate && timeSlots.length === 0) {
        <p class="text-muted text-center m-0" style="font-size:13px;">
          {{ 'MURAL.SCHEDULE.NO_SLOTS' | translate }}
        </p>
      }
    </div>
  `,
  styles: [
    `
      .calendar-wrapper {
        display: flex;
        justify-content: center;

        mat-calendar {
          width: 100%;
          max-width: 360px;
        }
      }

      .time-slots-label {
        font-size: 14px;
        color: var(--mat-sys-on-surface-variant, #666);
      }

      .time-slots-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .time-slot-btn {
        padding: 6px 14px;
        border: 1.5px solid var(--mat-sys-outline-variant, #ccc);
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        background: transparent;
        color: var(--mat-sys-on-surface, #111);
        cursor: pointer;
        transition: all 0.15s;
      }

      .time-slot-btn:hover {
        border-color: var(--mat-sys-primary, #e8541e);
        color: var(--mat-sys-primary, #e8541e);
        background: var(--mat-sys-surface-variant, #fff3ee);
      }

      .time-slot-btn--active {
        background: var(--mat-sys-primary, #e8541e);
        border-color: var(--mat-sys-primary, #e8541e);
        color: #fff;
      }
    `,
  ],
})
export class AppointmentCalendarPickerComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() availabilitySlots: AvailabilitySlot[] = [];

  @Input() blockedSlots: { date: string; time: string | null }[] = [];

  @Output() selectionChange = new EventEmitter<CalendarSelection>();

  readonly minDate = this.getTomorrow();

  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  timeSlots: string[] = [];

  private viewDestroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.viewDestroyed = true;
    });
  }

  ngOnChanges(): void {
    if (!this.selectedDate) {
      return;
    }

    this.deferStateChange(() => {
      if (!this.selectedDate) {
        return;
      }

      if (!this.dateFilter(this.selectedDate)) {
        this.selectedDate = null;
        this.selectedTime = null;
        this.timeSlots = [];
        return;
      }

      this.buildTimeSlots(this.selectedDate);

      if (this.selectedTime && !this.timeSlots.includes(this.selectedTime)) {
        this.selectedTime = null;
      }
    });
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }

    const normalizedDate = this.normalizeDate(date);
    const today = this.normalizeDate(new Date());

    if (normalizedDate <= today) {
      return false;
    }

    const dayName = WEEKDAY_NAME_BY_JS_INDEX[normalizedDate.getDay()];

    const daySlot = this.availabilitySlots.find((slot) => slot.day === dayName);

    if (!daySlot) {
      return false;
    }

    const dateStr = formatDateToISO(normalizedDate);

    const isFullDayBlocked = this.blockedSlots.some(
      (slot) => slot.date === dateStr && slot.time === null,
    );

    if (isFullDayBlocked) {
      return false;
    }

    const allTimes = generateTimeSlots(daySlot.startTime, daySlot.endTime);

    if (!allTimes.length) {
      return false;
    }

    const bookedTimesForDay = this.getBookedTimesForDay(dateStr);

    return allTimes.some((time) => !bookedTimesForDay.includes(time));
  };

  onDateSelected(date: Date | null): void {
    if (!date) {
      return;
    }

    this.deferStateChange(() => {
      const normalizedDate = this.normalizeDate(date);

      this.selectedDate = normalizedDate;
      this.selectedTime = null;
      this.buildTimeSlots(normalizedDate);
    });
  }

  selectTime(time: string): void {
    if (!this.selectedDate) {
      return;
    }

    if (!this.timeSlots.includes(time)) {
      return;
    }

    this.deferStateChange(() => {
      this.selectedTime = time;
      this.emitSelection();
    });
  }

  private buildTimeSlots(date: Date): void {
    const normalizedDate = this.normalizeDate(date);
    const dayName = WEEKDAY_NAME_BY_JS_INDEX[normalizedDate.getDay()];

    const daySlot = this.availabilitySlots.find((slot) => slot.day === dayName);

    if (!daySlot) {
      this.timeSlots = [];
      return;
    }

    const dateStr = formatDateToISO(normalizedDate);
    const allTimes = generateTimeSlots(daySlot.startTime, daySlot.endTime);
    const bookedTimesForDay = this.getBookedTimesForDay(dateStr);

    this.timeSlots = allTimes.filter(
      (time) => !bookedTimesForDay.includes(time),
    );

    if (this.selectedTime && !this.timeSlots.includes(this.selectedTime)) {
      this.selectedTime = null;
    }
  }

  private emitSelection(): void {
    if (!this.selectedDate || !this.selectedTime) {
      return;
    }

    const dayName = WEEKDAY_NAME_BY_JS_INDEX[this.selectedDate.getDay()];

    this.selectionChange.emit({
      date: formatDateToISO(this.selectedDate),
      day: dayName,
      time: this.selectedTime,
    });
  }

  private getBookedTimesForDay(dateStr: string): string[] {
    return this.blockedSlots
      .filter((slot) => slot.date === dateStr && slot.time !== null)
      .map((slot) => slot.time as string);
  }

  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
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
}
