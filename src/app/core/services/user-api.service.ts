import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

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

  updateProfile(payload: UpdateProfilePayload): Observable<AppUserProfileDto> {
    return this.request.patchPath<AppUserProfileDto, UpdateProfilePayload>(
      '/users/me/profile',
      payload,
    );
  }
}
