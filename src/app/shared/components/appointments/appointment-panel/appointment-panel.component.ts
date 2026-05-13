import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import {
  AppointmentDto,
  AppointmentStatus,
} from 'src/app/core/services/appointment-api.service';

import { StatusBadgeComponent } from 'src/app/shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from 'src/app/shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from 'src/app/shared/components/loading-state/loading-state.component';
import { AppointmentKanbanComponent } from '../appointment-kanban/appointment-kanban.component';

export type AppointmentPanelRole = 'customer' | 'provider';
export type AppointmentViewMode = 'list' | 'kanban';

@Component({
  selector: 'app-appointment-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslateModule,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    AppointmentKanbanComponent,
  ],
  templateUrl: './appointment-panel.component.html',
  styleUrls: ['./appointment-panel.component.scss'],
})
export class AppointmentPanelComponent {
  @Input() role: AppointmentPanelRole = 'customer';
  @Input() appointments: AppointmentDto[] = [];
  @Input() isLoading = false;

  @Input() viewMode: AppointmentViewMode = 'list';
  @Input() updatingAppointmentId: string | null = null;
  @Input() payingAppointmentId: string | null = null;
  @Input() cancellingAppointmentId: string | null = null;

  @Output() viewModeChange = new EventEmitter<AppointmentViewMode>();

  @Output() pay = new EventEmitter<AppointmentDto>();
  @Output() cancelAsCustomer = new EventEmitter<AppointmentDto>();

  @Output() statusChange = new EventEmitter<{
    appointment: AppointmentDto;
    status: AppointmentStatus;
  }>();

  readonly updatingSignal = signal<string | null>(null);

  ngOnChanges(): void {
    this.updatingSignal.set(this.updatingAppointmentId);
  }

  canShowProviderActions(): boolean {
    return this.role === 'provider';
  }

  canShowCustomerActions(): boolean {
    return this.role === 'customer';
  }

  canPay(appointment: AppointmentDto): boolean {
    return ['confirmed', 'awaiting_payment'].includes(appointment.status);
  }

  canCancelAsCustomer(appointment: AppointmentDto): boolean {
    return ['pending', 'confirmed', 'awaiting_payment'].includes(appointment.status);
  }

  canConfirm(appointment: AppointmentDto): boolean {
    return appointment.status === 'pending';
  }

  canCancelAsProvider(appointment: AppointmentDto): boolean {
    return ['pending', 'confirmed', 'awaiting_payment'].includes(appointment.status);
  }

  canComplete(appointment: AppointmentDto): boolean {
    return appointment.status === 'paid';
  }

  setViewMode(mode: AppointmentViewMode): void {
    this.viewModeChange.emit(mode);
  }
}
