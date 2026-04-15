import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppointmentDto } from 'src/app/core/services/appointment-api.service';
import { StatusBadgeComponent } from 'src/app/shared/components/status-badge/status-badge.component';
import { CanPayAppointmentPipe } from '../../pipes/can-pay-appointment.pipe';

@Component({
  selector: 'app-customer-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    StatusBadgeComponent,
    CanPayAppointmentPipe,
  ],
  templateUrl: './customer-appointments.component.html',
  styleUrls: ['./customer-appointments.component.scss'],
})
export class CustomerAppointmentsComponent {
  @Input() appointments: AppointmentDto[] = [];
  @Input() isLoading = false;
  @Input() payingAppointmentId: string | null = null;

  @Output() pay = new EventEmitter<AppointmentDto>();
  @Output() chat = new EventEmitter<AppointmentDto>();
}
