import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

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

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  constructor(private readonly api: MuralApiService) {}

  /** Solicita um agendamento */
  create(payload: CreateAppointmentPayload): Observable<AppointmentDto> {
    return this.api.post<AppointmentDto>('/appointments', payload);
  }

  /** Lista os agendamentos do usuário autenticado */
  findMine(): Observable<AppointmentDto[]> {
    return this.api.get<AppointmentDto[]>('/appointments/mine');
  }

  /** Lista agendamentos de um serviço (para o prestador) */
  findByService(serviceId: string): Observable<AppointmentDto[]> {
    return this.api.get<AppointmentDto[]>(`/appointments/service/${serviceId}`);
  }

  /** Atualiza o status de um agendamento */
  updateStatus(id: string, status: AppointmentStatus): Observable<AppointmentDto> {
    return this.api.patch<AppointmentDto>(`/appointments/${id}/status`, { status });
  }
}
