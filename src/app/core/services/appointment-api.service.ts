import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface AppointmentDto {
  id: string;
  serviceId: string;
  customerId: string;
  scheduledDate: string;
  scheduledDay: string;
  scheduledSlot?: string;
  notes?: string;
  status: AppointmentStatus;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  amountInCents?: number;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  service?: {
    id: string;
    name: string;
    contact: string;
    priceInCents?: number;
    provider?: { id: string; displayName: string };
  };
  customer?: { displayName: string; phone?: string };
  createdAt: string;
  updatedAt: string;
}

export interface AvailableDate {
  date: string;
  day: string;
  slots: string[];
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amountInCents: number;
}

export interface CreateAppointmentPayload {
  serviceId: string;
  scheduledDate: string;
  scheduledDay: string;
  scheduledSlot?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  constructor(private readonly api: MuralApiService) {}

  /** Cria um agendamento com status pending_payment */
  create(payload: CreateAppointmentPayload): Observable<AppointmentDto> {
    return this.api.post<AppointmentDto>('/appointments', payload);
  }

  /**
   * Inicia o pagamento de um agendamento.
   * Retorna o clientSecret do Stripe para confirmar o pagamento no frontend.
   */
  initiatePayment(appointmentId: string): Observable<PaymentIntentResponse> {
    return this.api.post<PaymentIntentResponse>(`/appointments/${appointmentId}/pay`, {});
  }

  /**
   * Morador confirma que o serviço foi concluído.
   * Libera o pagamento ao prestador.
   */
  confirmCompleted(appointmentId: string): Observable<AppointmentDto> {
    return this.api.patch<AppointmentDto>(`/appointments/${appointmentId}/complete`, {});
  }

  /**
   * Cancela o agendamento com reembolso automático.
   */
  cancel(appointmentId: string): Observable<AppointmentDto> {
    return this.api.patch<AppointmentDto>(`/appointments/${appointmentId}/cancel`, {});
  }

  /**
   * Retorna os dias e horários disponíveis de um serviço.
   */
  getAvailableDates(serviceId: string, daysAhead = 30): Observable<AvailableDate[]> {
    return this.api.get<AvailableDate[]>(`/appointments/available/${serviceId}?daysAhead=${daysAhead}`);
  }

  /** Lista os agendamentos do usuário autenticado */
  findMine(): Observable<AppointmentDto[]> {
    return this.api.get<AppointmentDto[]>('/appointments/mine');
  }

  /** Lista agendamentos de um serviço (para o prestador) */
  findByService(serviceId: string): Observable<AppointmentDto[]> {
    return this.api.get<AppointmentDto[]>(`/appointments/service/${serviceId}`);
  }

  /** Retorna um agendamento pelo ID */
  findOne(id: string): Observable<AppointmentDto> {
    return this.api.get<AppointmentDto>(`/appointments/${id}`);
  }
}
