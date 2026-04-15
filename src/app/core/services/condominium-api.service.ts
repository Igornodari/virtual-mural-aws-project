import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';
import { RequestService } from './request.service';

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
  name?: string;
  zipCode?: string;
  addressZipCode?: string;
  street?: string;
  addressStreet?: string;
  number?: string;
  addressNumber?: string;
  complement?: string;
  addressComplement?: string;
  neighborhood?: string;
  addressNeighborhood?: string;
  city?: string;
  addressCity?: string;
  state?: string;
  addressState?: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CondominiumApiService {
  private readonly api = inject(MuralApiService);
  private readonly request = inject(RequestService);

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

  update(id: string, payload: Partial<CreateCondominiumPayload>): Observable<CondominiumDto> {
    return this.api.patch<CondominiumDto>(`/condominiums/${id}`, payload);
  }

  /** Consulta o CEP na API pública ViaCEP — sem interceptor de auth */
  lookupCep(cep: string): Observable<ViaCepResponse> {
    return this.request.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`);
  }
}
