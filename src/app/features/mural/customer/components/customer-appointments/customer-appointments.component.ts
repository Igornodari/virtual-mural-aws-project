import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppointmentDto } from 'src/app/core/services/appointment-api.service';
import { StatusBadgeComponent } from 'src/app/shared/components/status-badge/status-badge.component';
import { CanPayAppointmentPipe } from '../../pipes/can-pay-appointment.pipe';

@Component({
  selector: 'app-customer-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
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
}
