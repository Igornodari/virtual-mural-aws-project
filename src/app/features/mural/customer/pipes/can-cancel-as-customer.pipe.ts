import { Pipe, PipeTransform } from '@angular/core';

import { AppointmentDto } from 'src/app/core/services/appointment-api.service';

/**
 * Determina se o morador pode cancelar este agendamento.
 *
 * Regra de negócio: pode cancelar enquanto o pagamento não estiver
 * efetivado. Depois de `paid`/`completed` o cancelamento deve ser
 * tratado fora do app (sem reembolso) para evitar desistências
 * que prejudiquem o prestador.
 */
@Pipe({
  name: 'canCancelAsCustomer',
  standalone: true,
})
export class CanCancelAsCustomerPipe implements PipeTransform {
  transform(appointment: AppointmentDto | null | undefined): boolean {
    if (!appointment) return false;
    return (
      appointment.status === 'pending' ||
      appointment.status === 'confirmed' ||
      appointment.status === 'awaiting_payment'
    );
  }
}
