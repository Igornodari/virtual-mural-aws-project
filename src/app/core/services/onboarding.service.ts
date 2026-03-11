import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CondominiumAddress, OnboardingProfile, UserRole } from '../../shared/types';

const STORAGE_KEY = 'APP_ONBOARDING';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly profileSubject = new BehaviorSubject<OnboardingProfile>(this.loadFromStorage());
  readonly profile$ = this.profileSubject.asObservable();

  get profile(): OnboardingProfile {
    return this.profileSubject.value;
  }

  get isOnboardingComplete(): boolean {
    const p = this.profile;
    return !!(p.condominiumAddress && p.role && p.onboardingCompleted);
  }

  get hasCondominium(): boolean {
    return !!this.profile.condominiumAddress;
  }

  get hasRole(): boolean {
    return !!this.profile.role;
  }

  get role(): UserRole | null {
    return this.profile.role;
  }

  saveCondominiumAddress(address: CondominiumAddress): void {
    const updated: OnboardingProfile = {
      ...this.profile,
      condominiumAddress: address,
      onboardingCompleted: !!(address && this.profile.role),
    };
    this.persist(updated);
  }

  saveRole(role: UserRole): void {
    const updated: OnboardingProfile = {
      ...this.profile,
      role,
      onboardingCompleted: !!(this.profile.condominiumAddress && role),
    };
    this.persist(updated);
  }

  clear(): void {
    const empty: OnboardingProfile = {
      condominiumId: null,
      condominiumAddress: null,
      role: null,
      onboardingCompleted: false,
    };
    this.persist(empty);
  }

  private persist(profile: OnboardingProfile): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } catch (e) {
      // Ignorar erro de localStorage
    }
    this.profileSubject.next(profile);
  }

  private loadFromStorage(): OnboardingProfile {
    const empty: OnboardingProfile = {
      condominiumId: null,
      condominiumAddress: null,
      role: null,
      onboardingCompleted: false,
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as OnboardingProfile;
      }
    } catch (e) {
      // Ignorar erro de parse
    }
    return empty;
  }
}
