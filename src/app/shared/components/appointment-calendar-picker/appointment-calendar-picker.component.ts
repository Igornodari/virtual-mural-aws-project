import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
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
  date: string;      // YYYY-MM-DD
  day: string;       // 'Segunda-feira'
  time: string;      // 'HH:mm'
}

@Component({
  selector: 'app-appointment-calendar-picker',
  standalone: true,
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
      <!-- Calendário inline -->
      <div class="calendar-wrapper">
        <mat-calendar
          [minDate]="minDate"
          [dateFilter]="dateFilter"
          [selected]="selectedDate"
          (selectedChange)="onDateSelected($event)"
        />
      </div>

      <!-- Seleção de horário -->
      @if (selectedDate && timeSlots.length > 0) {
        <div class="time-slots-section d-flex flex-col gap-10">
          <p class="time-slots-label d-flex align-items-center gap-5 m-0">
            <mat-icon class="text-primary" style="font-size:18px;width:18px;height:18px;">schedule</mat-icon>
            {{ 'MURAL.SCHEDULE.SELECT_TIME' | translate }}
            <strong>{{ selectedDate | date:'dd/MM' }}</strong>
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
  styles: [`
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

      &:hover {
        border-color: var(--mat-sys-primary, #e8541e);
        color: var(--mat-sys-primary, #e8541e);
        background: var(--mat-sys-surface-variant, #fff3ee);
      }

      &--active {
        background: var(--mat-sys-primary, #e8541e);
        border-color: var(--mat-sys-primary, #e8541e);
        color: #fff;
      }
    }
  `],
})
export class AppointmentCalendarPickerComponent implements OnChanges {
  /** Slots de disponibilidade do prestador */
  @Input() availabilitySlots: AvailabilitySlot[] = [];

  /**
   * Slots bloqueados por agendamentos confirmados.
   * time=null → dia inteiro bloqueado (legado); time='HH:mm' → horário específico bloqueado.
   */
  @Input() blockedSlots: { date: string; time: string | null }[] = [];

  /** Emite a seleção completa quando data + horário estão escolhidos */
  @Output() selectionChange = new EventEmitter<CalendarSelection>();

  readonly minDate = new Date(new Date().setDate(new Date().getDate() + 1));

  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  timeSlots: string[] = [];

  ngOnChanges(): void {
    // Reavalia quando os inputs mudam
    if (this.selectedDate) {
      this.buildTimeSlots(this.selectedDate);
    }
  }

  /** Filtra datas disponíveis no mat-calendar */
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date <= today) return false;

    const dayName = WEEKDAY_NAME_BY_JS_INDEX[date.getDay()];
    const hasSlot = this.availabilitySlots.some((s) => s.day === dayName);
    if (!hasSlot) return false;

    const dateStr = formatDateToISO(date);

    // Dia inteiro bloqueado (agendamento legado sem horário)
    if (this.blockedSlots.some((s) => s.date === dateStr && s.time === null)) {
      return false;
    }

    // Todos os horários do dia estão ocupados
    const daySlot = this.availabilitySlots.find((s) => s.day === dayName);
    if (daySlot) {
      const allTimes = generateTimeSlots(daySlot.startTime, daySlot.endTime);
      const bookedTimesForDay = this.blockedSlots
        .filter((s) => s.date === dateStr && s.time !== null)
        .map((s) => s.time as string);
      if (allTimes.length > 0 && allTimes.every((t) => bookedTimesForDay.includes(t))) {
        return false;
      }
    }

    return true;
  };

  onDateSelected(date: Date | null): void {
    if (!date) return;

    this.selectedDate = date;
    this.selectedTime = null;
    this.buildTimeSlots(date);
  }

  selectTime(time: string): void {
    this.selectedTime = time;
    this.emitSelection();
  }

  /** Constrói a lista de horários disponíveis para a data selecionada. */
  private buildTimeSlots(date: Date): void {
    const dayName = WEEKDAY_NAME_BY_JS_INDEX[date.getDay()];
    const daySlot = this.availabilitySlots.find((s) => s.day === dayName);

    if (!daySlot) {
      this.timeSlots = [];
      return;
    }

    const dateStr = formatDateToISO(date);
    const allTimes = generateTimeSlots(daySlot.startTime, daySlot.endTime);
    const bookedTimesForDay = this.blockedSlots
      .filter((s) => s.date === dateStr && s.time !== null)
      .map((s) => s.time as string);

    this.timeSlots = allTimes.filter((t) => !bookedTimesForDay.includes(t));

    // Se o horário previamente selecionado não está mais disponível, limpa.
    if (this.selectedTime && !this.timeSlots.includes(this.selectedTime)) {
      this.selectedTime = null;
    }
  }

  /** Emite a seleção completa apenas quando data e horário estão definidos. */
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
}