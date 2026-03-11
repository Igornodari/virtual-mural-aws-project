import { Injectable } from '@angular/core';
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
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  reviews?: ReviewDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDto {
  id: string;
  rating: number;
  comment?: string;
  authorId: string;
  author?: { displayName: string; avatarUrl?: string };
  createdAt: string;
}

export interface CreateServicePayload {
  name: string;
  description: string;
  price: string;
  contact: string;
  category: string;
  availableDays: string[];
}

export interface UpdateServicePayload extends Partial<CreateServicePayload> {}

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  constructor(private readonly api: MuralApiService) {}

  /** Lista todos os serviços do condomínio do usuário autenticado */
  findAll(): Observable<ServiceDto[]> {
    return this.api.get<ServiceDto[]>('/services');
  }

  /** Lista apenas os serviços do prestador autenticado */
  findMine(): Observable<ServiceDto[]> {
    return this.api.get<ServiceDto[]>('/services', { mine: true });
  }

  /** Retorna detalhes de um serviço com avaliações */
  findOne(id: string): Observable<ServiceDto> {
    return this.api.get<ServiceDto>(`/services/${id}`);
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
}
