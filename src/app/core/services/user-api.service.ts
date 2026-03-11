import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

export type UserRole = 'provider' | 'customer';

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
  roleInCondominium: UserRole | null;
  onboardingCompleted: boolean;
  addressCompleted: boolean;
  roleCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOnboardingPayload {
  condominiumId?: string;
  roleInCondominium?: UserRole;
}

export interface UpdateProfilePayload {
  givenName?: string;
  familyName?: string;
  phone?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(private readonly api: MuralApiService) {}

  /** Retorna o perfil completo do usuário autenticado */
  getMe(): Observable<AppUserProfileDto> {
    return this.api.get<AppUserProfileDto>('/users/me');
  }

  /** Salva o condomínio e/ou o perfil do usuário durante o onboarding */
  updateOnboarding(payload: UpdateOnboardingPayload): Observable<AppUserProfileDto> {
    return this.api.patch<AppUserProfileDto>('/users/me/onboarding', payload);
  }

  /** Atualiza dados do perfil (nome, telefone, avatar) */
  updateProfile(payload: UpdateProfilePayload): Observable<AppUserProfileDto> {
    return this.api.patch<AppUserProfileDto>('/users/me/profile', payload);
  }
}
