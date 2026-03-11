import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

export interface CondominiumDto {
  id: string;
  name: string;
  addressZipCode: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCondominiumPayload {
  name: string;
  addressZipCode: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
}

@Injectable({ providedIn: 'root' })
export class CondominiumApiService {
  constructor(private readonly api: MuralApiService) {}

  /** Busca condomínios pelo CEP — usado no onboarding para verificar se já existe */
  findByZipCode(zipCode: string): Observable<CondominiumDto[]> {
    return this.api.get<CondominiumDto[]>('/condominiums', { zipCode });
  }

  /** Cria um novo condomínio — chamado quando nenhum é encontrado pelo CEP */
  create(payload: CreateCondominiumPayload): Observable<CondominiumDto> {
    return this.api.post<CondominiumDto>('/condominiums', payload);
  }

  findOne(id: string): Observable<CondominiumDto> {
    return this.api.get<CondominiumDto>(`/condominiums/${id}`);
  }
}
