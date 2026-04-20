import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'awaiting_payment'
  | 'paid'
  | 'cancelled'
  | 'completed';

export type PaymentMethod = 'pix' | 'credit_card';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface AppointmentDto {
  id: string;
  serviceId: string;
  customerId: string;
  scheduledDate: string;
  scheduledDay: string;
  scheduledTime?: string | null;
  notes?: string;
  status: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  service?: {
    id: string;
    name: string;
    price: string;
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
  scheduledTime?: string;
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

  create(payload: CreateAppointmentPayload): Observable<AppointmentDto> {
    return this.request.post<AppointmentDto, CreateAppointmentPayload>(
      '/appointments',
      payload,
    );
  }

  findMine(): Observable<AppointmentDto[]> {
    return this.request.get<AppointmentDto[]>('/appointments/mine');
  }

  findByService(serviceId: string): Observable<AppointmentDto[]> {
    return this.request.get<AppointmentDto[]>(`/appointments/service/${serviceId}`);
  }

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
