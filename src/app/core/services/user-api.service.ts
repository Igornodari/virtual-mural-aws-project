import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

export interface AppUserProfileDto {
  id: string;
  cognitoSub: string;
  email: string;
  givenName: string;
  familyName: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  condominiumId: string | null;
  /**
   * Flag opt-in: true significa que o usuário ativou o modo prestador
   * e pode publicar serviços. Todo usuário autenticado e com condomínio
   * é morador por padrão (não há flag para isso).
   */
  isProvider: boolean;
  onboardingCompleted: boolean;
  addressCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  stripeAccountId?: string | null;
  stripeAccountStatus?: 'pending' | 'active' | 'restricted' | null;
  condominium?: {
    id: string;
    name?: string;
    addressZipCode?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
  } | null;
}

export interface UpdateOnboardingPayload {
  condominiumId?: string;
  isProvider?: boolean;
}

export interface UpdateProfilePayload {
  givenName?: string;
  familyName?: string;
  phone?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly request = inject(RequestService);

  getMe(): Observable<AppUserProfileDto> {
    return this.request.get<AppUserProfileDto>('/users/me');
  }

  updateOnboarding(payload: UpdateOnboardingPayload): Observable<AppUserProfileDto> {
    return this.request.patchPath<AppUserProfileDto, UpdateOnboardingPayload>(
      '/users/me/onboarding',
      payload,
    );
  }

  /**
   * Ativa ou desativa o modo prestador do usuário autenticado.
   * Conveniência sobre `updateOnboarding` para o fluxo "Virar prestador".
   */
  becomeProvider(value: boolean = true): Observable<AppUserProfileDto> {
    return this.updateOnboarding({ isProvider: value });
  }

  updateProfile(payload: UpdateProfilePayload): Observable<AppUserProfileDto> {
    return this.request.patchPath<AppUserProfileDto, UpdateProfilePayload>(
      '/users/me/profile',
      payload,
    );
  }
}
