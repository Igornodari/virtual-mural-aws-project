import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { AppointmentDto, AppointmentStatus } from 'src/app/core/services/appointment-api.service';
import {
  canCancelAppointment,
  canCompleteAppointment,
  canConfirmAppointment,
} from 'src/app/shared/utils/appointment-status.util';

export interface KanbanColumn {
  status: AppointmentStatus;
  labelKey: string;
  icon: string;
  color: string;
  dropTargets: AppointmentStatus[];
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    status: 'pending',
    labelKey: 'COMMON.STATUS.PENDING',
    icon: 'hourglass_empty',
    color: '#f59e0b',
    dropTargets: [],
  },
  {
    status: 'confirmed',
    labelKey: 'COMMON.STATUS.CONFIRMED',
    icon: 'check_circle',
    color: '#3b82f6',
    dropTargets: ['pending'],
  },
  {
    status: 'awaiting_payment',
    labelKey: 'COMMON.STATUS.AWAITING_PAYMENT',
    icon: 'payment',
    color: '#8b5cf6',
    dropTargets: [], // definido automaticamente pelo fluxo de pagamento do cliente
  },
  {
    status: 'paid',
    labelKey: 'COMMON.STATUS.PAID',
    icon: 'paid',
    color: '#10b981',
    dropTargets: [], // definido pelo webhook do Stripe
  },
  {
    status: 'completed',
    labelKey: 'COMMON.STATUS.COMPLETED',
    icon: 'task_alt',
    color: '#059669',
    dropTargets: ['paid'],
  },
];

@Component({
  selector: 'app-appointment-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule,
  ],
  template: `
    <div class="kanban-board">
      @for (col of columns; track col.status) {
        @let items = getItems(col.status);

        <div class="kanban-column">
          <!-- Header da coluna -->
          <div class="kanban-column__header" [style.border-top-color]="col.color">
            <mat-icon [style.color]="col.color">{{ col.icon }}</mat-icon>
            <span class="kanban-column__title">{{ col.labelKey | translate }}</span>
            <span class="kanban-column__badge" [style.background]="col.color">
              {{ items.length }}
            </span>
          </div>

          <!-- Drop list -->
          <div
            cdkDropList
            [id]="'list-' + col.status"
            [cdkDropListData]="items"
            [cdkDropListConnectedTo]="getConnectedListIds(col)"
            (cdkDropListDropped)="onDrop($event, col.status)"
            class="kanban-column__list"
            [class.kanban-column__list--empty]="items.length === 0"
          >
            @for (appt of items; track appt.id) {
              <div
                cdkDrag
                [cdkDragData]="appt"
                class="kanban-card"
                [class.kanban-card--updating]="updatingId() === appt.id"
              >
                <!-- Drag handle preview -->
                <div *cdkDragPlaceholder class="kanban-card-placeholder"></div>

                <!-- Card body -->
                <div class="kanban-card__header d-flex justify-content-between align-items-start">
                  <span class="kanban-card__service" [matTooltip]="appt.service?.name ?? ''">
                    {{ appt.service?.name ?? ('MURAL.KANBAN.UNKNOWN_SERVICE' | translate) }}
                  </span>
                  @if (updatingId() === appt.id) {
                    <mat-spinner diameter="16" />
                  }
                </div>

                <div class="kanban-card__customer d-flex align-items-center gap-5">
                  <mat-icon style="font-size:14px;width:14px;height:14px;">person</mat-icon>
                  <span>{{
                    appt.customer?.displayName ?? ('MURAL.KANBAN.UNKNOWN_CUSTOMER' | translate)
                  }}</span>
                </div>

                <div class="kanban-card__date d-flex align-items-center gap-5">
                  <mat-icon style="font-size:14px;width:14px;height:14px;">event</mat-icon>
                  <span>
                    {{ appt.scheduledDate | date: 'dd/MM/yyyy' }}
                    @if (appt.scheduledTime) {
                      · {{ appt.scheduledTime }}
                    }
                  </span>
                </div>

                <!-- Quick actions -->
                <div class="kanban-card__actions d-flex gap-5">
                  @if (canConfirm(appt)) {
                    <button
                      mat-stroked-button
                      color="primary"
                      class="action-btn"
                      [disabled]="!!updatingId()"
                      (click)="
                        $event.stopPropagation();
                        statusChange.emit({ appointment: appt, status: 'confirmed' })
                      "
                    >
                      <mat-icon>check</mat-icon>
                      {{ 'COMMON.ACTIONS.CONFIRM' | translate }}
                    </button>
                  }

                  @if (canComplete(appt)) {
                    <button
                      mat-stroked-button
                      color="accent"
                      class="action-btn"
                      [disabled]="!!updatingId()"
                      (click)="
                        $event.stopPropagation();
                        statusChange.emit({ appointment: appt, status: 'completed' })
                      "
                    >
                      <mat-icon>task_alt</mat-icon>
                      {{ 'COMMON.ACTIONS.COMPLETE' | translate }}
                    </button>
                  }

                  @if (canCancel(appt)) {
                    <button
                      mat-icon-button
                      color="warn"
                      class="cancel-btn"
                      [matTooltip]="'COMMON.ACTIONS.CANCEL' | translate"
                      [disabled]="!!updatingId()"
                      (click)="
                        $event.stopPropagation();
                        statusChange.emit({ appointment: appt, status: 'cancelled' })
                      "
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  }
                </div>
              </div>
            }

            @if (items.length === 0) {
              <div class="kanban-empty">
                <mat-icon>inbox</mat-icon>
                <span>{{ 'MURAL.KANBAN.EMPTY_COLUMN' | translate }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .kanban-board {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 8px;
        align-items: flex-start;
      }

      .kanban-column {
        flex: 0 0 260px;
        min-width: 260px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .kanban-column__header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: var(--mat-sys-surface-variant, #f5f5f5);
        border-radius: 10px 10px 0 0;
        border-top: 4px solid transparent;
      }

      .kanban-column__title {
        flex: 1;
        font-size: 13px;
        font-weight: 600;
        color: var(--mat-sys-on-surface, #111);
      }

      .kanban-column__badge {
        min-width: 22px;
        height: 22px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        padding: 0 6px;
      }

      .kanban-column__list {
        min-height: 100px;
        background: var(--mat-sys-surface-container-lowest, #fafafa);
        border-radius: 0 0 10px 10px;
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        border-top: none;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        &--empty {
          border: 2px dashed var(--mat-sys-outline-variant, #e0e0e0);
          border-top: none;
        }
      }

      .kanban-card {
        background: var(--mat-sys-surface, #fff);
        border-radius: 8px;
        padding: 12px;
        border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        cursor: grab;
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: box-shadow 0.15s;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        &--updating {
          opacity: 0.6;
          pointer-events: none;
        }
      }

      .kanban-card-placeholder {
        background: var(--mat-sys-primary-container, #fff3ee);
        border: 2px dashed var(--mat-sys-primary, #e8541e);
        border-radius: 8px;
        min-height: 80px;
      }

      .kanban-card__service {
        font-size: 13px;
        font-weight: 600;
        color: var(--mat-sys-on-surface, #111);
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .kanban-card__customer,
      .kanban-card__date {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant, #666);
      }

      .kanban-card__actions {
        flex-wrap: wrap;
        margin-top: 4px;
      }

      .action-btn {
        font-size: 11px;
        height: 28px;
        line-height: 28px;
        padding: 0 8px;

        ::ng-deep .mat-mdc-button-touch-target {
          height: 28px;
        }
      }

      .cancel-btn {
        width: 28px;
        height: 28px;
        line-height: 28px;
      }

      .kanban-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 24px 0;
        color: var(--mat-sys-on-surface-variant, #aaa);
        font-size: 12px;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          opacity: 0.4;
        }
      }

      /* Drag preview */
      .cdk-drag-preview {
        background: var(--mat-sys-surface, #fff);
        border-radius: 8px;
        padding: 12px;
        border: 1px solid var(--mat-sys-primary, #e8541e);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
      }

      .cdk-drag-animating {
        transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
})
export class AppointmentKanbanComponent {
  readonly columns = KANBAN_COLUMNS;

  @Input() appointments: AppointmentDto[] = [];
  @Input() updatingId = signal<string | null>(null);

  @Output() statusChange = new EventEmitter<{
    appointment: AppointmentDto;
    status: AppointmentStatus;
  }>();

  getItems(status: AppointmentStatus): AppointmentDto[] {
    return this.appointments.filter((a) => a.status === status);
  }

  getConnectedListIds(col: KanbanColumn): string[] {
    return col.dropTargets.map((s) => `list-${s}`);
  }

  onDrop(event: CdkDragDrop<AppointmentDto[]>, targetStatus: AppointmentStatus): void {
    if (event.previousContainer === event.container) return;

    const appointment: AppointmentDto = event.item.data;
    this.statusChange.emit({ appointment, status: targetStatus });
  }

  canConfirm = canConfirmAppointment;
  canCancel = canCancelAppointment;
  canComplete = canCompleteAppointment;
}
