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
   * Flag opt-in: true significa que o usuario ativou o modo prestador
   * e pode publicar servicos. Todo usuario autenticado e com condominio
   * e morador por padrao (nao ha flag para isso).
   */
  isProvider: boolean;
  onboardingCompleted: boolean;
  addressCompleted: boolean;
  /** LGPD — timestamp do ultimo aceite dos termos. Null = nao aceitou ainda. */
  termsAcceptedAt: string | null;
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
   * Ativa ou desativa o modo prestador do usuario autenticado.
   * Conveniencia sobre updateOnboarding para o fluxo "Virar prestador".
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

  /**
   * LGPD — Consentimento (Art. 7, I da Lei 13.709/2018)
   * Registra o aceite explicito dos Termos de Uso e Politica de Privacidade.
   */
  acceptTerms(): Observable<AppUserProfileDto> {
    return this.request.post<AppUserProfileDto>('/users/me/accept-terms', {});
  }
}
