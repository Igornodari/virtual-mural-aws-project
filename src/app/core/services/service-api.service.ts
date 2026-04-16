import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  price: string;
  contact: string;
  category: string;
  availableDays: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  providerId: string;
  condominiumId: string;
  clicks: number;
  interests: number;
  completions: number;
  abandonments: number;
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAnalyticsDto {
  serviceId: string;
  serviceName: string;
  clicks: number;
  interests: number;
  completions: number;
  abandonments: number;
  rating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  recentComments: { rating: number; comment: string; createdAt: string }[];
}

export interface CreateServicePayload {
  name: string;
  description: string;
  price: string;
  contact: string;
  category: string;
  availableDays: string[];
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

export type TrackMetric = 'clicks' | 'interests' | 'completions' | 'abandonments';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private readonly api = inject(MuralApiService);


  constructor() {}

  /** Lista todos os serviços do condomínio do usuário autenticado */
  findAll(): Observable<ServiceDto[]> {
    return this.api.get<ServiceDto[]>('/services');
  }

  /** Lista apenas os serviços do prestador autenticado */
  findMine(): Observable<ServiceDto[]> {
    return this.api.get<ServiceDto[]>('/services', { mine: true });
  }

  /** Retorna detalhes de um serviço */
  findOne(id: string): Observable<ServiceDto> {
    return this.api.get<ServiceDto>(`/services/${id}`);
  }

  /** Retorna analytics de todos os serviços do prestador autenticado */
  getProviderAnalytics(): Observable<ServiceAnalyticsDto[]> {
    return this.api.get<ServiceAnalyticsDto[]>('/services/analytics/me');
  }

  /** Retorna analytics de um serviço específico */
  getAnalytics(id: string): Observable<ServiceAnalyticsDto> {
    return this.api.get<ServiceAnalyticsDto>(`/services/${id}/analytics`);
  }

  /** Cria um novo serviço (apenas prestadores) */
  create(payload: CreateServicePayload): Observable<ServiceDto> {
    return this.api.post<ServiceDto>('/services', payload);
  }

  /** Atualiza um serviço existente */
  update(id: string, payload: UpdateServicePayload): Observable<ServiceDto> {
    return this.api.patch<ServiceDto>(`/services/${id}`, payload);
  }

  /** Remove um serviço (soft delete) */
  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/services/${id}`);
  }

  /**
   * Registra um evento de engajamento no backend.
   * Chamado pelo frontend quando o usuário interage com um card.
   */
  trackMetric(id: string, metric: TrackMetric): Observable<void> {
    return this.api.patch<void>(`/services/${id}/track/${metric}`, {});
  }
}
