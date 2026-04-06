import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentStatus } from 'src/app/core/services/appointment-api.service';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="'status-badge--' + status">
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;

      &--pending { background: #fef3c7; color: #92400e; }
      &--confirmed { background: #dcfce7; color: #166534; }
      &--awaiting_payment { background: #e0f2fe; color: #075985; }
      &--paid { background: #dcfce7; color: #166534; }
      &--cancelled { background: #fee2e2; color: #991b1b; }
      &--completed { background: #f3f4f6; color: #374151; }
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: AppointmentStatus;

  get label(): string {
    const labels: Record<AppointmentStatus, string> = {
      pending: 'Solicitado',
      confirmed: 'Confirmado',
      awaiting_payment: 'Aguardando pagamento',
      paid: 'Pago',
      cancelled: 'Cancelado',
      completed: 'Concluido',
    };
    return labels[this.status] || this.status;
  }
}
