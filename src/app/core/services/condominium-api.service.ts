import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
  private readonly request = inject(RequestService);

  findByZipCode(zipCode: string): Observable<CondominiumDto[]> {
    return this.request.get<CondominiumDto[]>('/condominiums', {
      params: { zipCode },
    });
  }

  create(payload: CreateCondominiumPayload): Observable<CondominiumDto> {
    return this.request.post<CondominiumDto, CreateCondominiumPayload>(
      '/condominiums',
      payload,
    );
  }

  findOne(id: string): Observable<CondominiumDto> {
    return this.request.get<CondominiumDto>(`/condominiums/${id}`);
  }

  update(
    id: string,
    payload: Partial<CreateCondominiumPayload>,
  ): Observable<CondominiumDto> {
    return this.request.patchPath<CondominiumDto, Partial<CreateCondominiumPayload>>(
      `/condominiums/${id}`,
      payload,
    );
  }

  lookupCep(cep: string): Observable<ViaCepResponse> {
    return this.request.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`);
  }
}
