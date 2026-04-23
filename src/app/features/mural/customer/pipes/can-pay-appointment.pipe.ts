import { Pipe, PipeTransform } from '@angular/core';

import { AppointmentDto } from 'src/app/core/services/appointment-api.service';
import { canPayAppointment } from 'src/app/shared/utils/appointment-status.util';

@Pipe({
  name: 'canPayAppointment',
  standalone: true,
})
export class CanPayAppointmentPipe implements PipeTransform {
  transform(appointment: AppointmentDto | null | undefined): boolean {
    return canPayAppointment(appointment);
  }
}
