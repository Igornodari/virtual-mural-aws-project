import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { AvailabilitySlot } from '../../types/availability.types';
import { WEEKDAYS } from '../../types/provider.types';

@Component({
  selector: 'app-weekly-availability-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule, MatIconModule, TranslateModule],
  template: `
    <div class="weekly-picker d-flex flex-col gap-10">
      @for (day of weekdays; track day) {
        @let slot = getSlot(day);
        @let enabled = !!slot;

        <div
          class="day-row d-flex align-items-center gap-15"
          [class.day-row--disabled]="!enabled"
        >
          <mat-checkbox
            [checked]="enabled"
            (change)="toggleDay(day)"
            class="day-checkbox"
          >
            <span class="day-label">{{ day }}</span>
          </mat-checkbox>

          @if (enabled && slot) {
            <div class="time-range d-flex align-items-center gap-8">
              <mat-icon class="time-icon">schedule</mat-icon>
              <input
                type="time"
                class="time-input"
                [value]="slot.startTime"
                (change)="updateTime(day, 'startTime', $any($event.target).value)"
              />
              <span class="time-separator">–</span>
              <input
                type="time"
                class="time-input"
                [value]="slot.endTime"
                (change)="updateTime(day, 'endTime', $any($event.target).value)"
              />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .weekly-picker {
      width: 100%;
    }

    .day-row {
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--mat-sys-surface-variant, #f5f5f5);
      transition: background 0.2s;
      /* Permite que a faixa de horário quebre para baixo no mobile. */
      flex-wrap: wrap;

      &:hover {
        background: var(--mat-sys-surface-container, #eeeeee);
      }

      &--disabled {
        opacity: 0.5;
      }
    }

    .day-checkbox {
      min-width: 160px;
    }

    .day-label {
      font-size: 14px;
      font-weight: 500;
    }

    .time-range {
      flex: 1;
      min-width: 0;
      /* Os inputs quebram entre si se faltar espaço. */
      flex-wrap: wrap;
    }

    .time-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-primary, #e8541e);
      flex-shrink: 0;
    }

    .time-input {
      border: 1px solid var(--mat-sys-outline-variant, #ccc);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 14px;
      font-family: inherit;
      background: var(--mat-sys-surface, #fff);
      color: var(--mat-sys-on-surface, #111);
      cursor: pointer;
      /* Largura adequada que encolhe sem estourar a linha. */
      min-width: 0;
      flex: 1 1 96px;
      max-width: 140px;

      &:focus {
        outline: 2px solid var(--mat-sys-primary, #e8541e);
        outline-offset: 1px;
        border-color: transparent;
      }
    }

    .time-separator {
      color: var(--mat-sys-on-surface-variant, #666);
      font-weight: 600;
      flex-shrink: 0;
    }

    /* Mobile: o checkbox ocupa a linha inteira e a faixa de horário desce,
       evitando overflow horizontal em telas estreitas. */
    @media (max-width: 599.98px) {
      .day-checkbox {
        min-width: 100%;
      }

      .time-range {
        width: 100%;
      }

      .time-input {
        max-width: none;
      }
    }
  `],
})
export class WeeklyAvailabilityPickerComponent {
  readonly weekdays = WEEKDAYS;

  @Input() value: AvailabilitySlot[] = [];
  @Output() valueChange = new EventEmitter<AvailabilitySlot[]>();

  getSlot(day: string): AvailabilitySlot | null {
    return this.value.find((s) => s.day === day) ?? null;
  }

  toggleDay(day: string): void {
    const exists = this.value.some((s) => s.day === day);

    if (exists) {
      this.valueChange.emit(this.value.filter((s) => s.day !== day));
    } else {
      this.valueChange.emit([
        ...this.value,
        { day, startTime: '09:00', endTime: '18:00' },
      ]);
    }
  }

  updateTime(day: string, field: 'startTime' | 'endTime', time: string): void {
    this.valueChange.emit(
      this.value.map((s) => (s.day === day ? { ...s, [field]: time } : s)),
    );
  }
}
