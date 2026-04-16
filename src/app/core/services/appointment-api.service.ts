import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface AppointmentDto {
  id: string;
  serviceId: string;
  customerId: string;
  scheduledDate: string;
  scheduledDay: string;
  notes?: string;
  status: AppointmentStatus;
  service?: {
    id: string;
    name: string;
    contact: string;
    provider?: { displayName: string };
  };
  customer?: { displayName: string; phone?: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  serviceId: string;
  scheduledDate: string;
  scheduledDay: string;
  notes?: string;
}

export interface AppointmentPaymentPayload {
  method: PaymentMethod;
}

export interface AppointmentPaymentDto {
  paymentId: string;
  paymentStatus: string;
  checkoutUrl?: string;
  checkoutSessionId?: string;
  qrCode?: string;
  qrCodeText?: string;
  appointment: AppointmentDto;
}

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly request = inject(RequestService);

  /** Solicita um agendamento */
  create(payload: CreateAppointmentPayload): Observable<AppointmentDto> {
    return this.request.post<AppointmentDto, CreateAppointmentPayload>(
      '/appointments',
      payload,
    );
  }

  /** Lista os agendamentos do usuário autenticado */
  findMine(): Observable<AppointmentDto[]> {
    return this.request.get<AppointmentDto[]>('/appointments/mine');
  }

  /** Lista agendamentos de um serviço (para o prestador) */
  findByService(serviceId: string): Observable<AppointmentDto[]> {
    return this.request.get<AppointmentDto[]>(`/appointments/service/${serviceId}`);
  }

  /** Atualiza o status de um agendamento */
  updateStatus(id: string, status: AppointmentStatus): Observable<AppointmentDto> {
    return this.request.patchPath<AppointmentDto, { status: AppointmentStatus }>(
      `/appointments/${id}/status`,
      { status },
    );
  }

  createPayment(id: string, payload: AppointmentPaymentPayload): Observable<AppointmentPaymentDto> {
    return this.request.post<AppointmentPaymentDto, AppointmentPaymentPayload>(
      `/appointments/${id}/payment`,
      payload,
    );
  }
}
