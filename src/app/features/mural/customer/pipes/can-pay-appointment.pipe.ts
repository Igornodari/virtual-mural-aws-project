import { Pipe, PipeTransform } from '@angular/core';

import { AppointmentDto } from 'src/app/core/services/appointment-api.service';

@Pipe({
  name: 'canPayAppointment',
  standalone: true,
})
export class CanPayAppointmentPipe implements PipeTransform {
  transform(appointment: AppointmentDto | null | undefined): boolean {
    return appointment?.status === 'confirmed' || appointment?.status === 'awaiting_payment';
  }
}
