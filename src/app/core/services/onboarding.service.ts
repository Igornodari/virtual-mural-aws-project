import { ErrorHandler, Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { CondominiumAddress, OnboardingProfile, UserRole } from '../../shared/types';
import { getDashboardRouteByRole, ROUTE_PATHS } from '../../shared/constant/route-paths.constant';
import {
  CondominiumApiService,
  CondominiumDto,
  CreateCondominiumPayload,
} from './condominium-api.service';
import { AppUserProfileDto, UserApiService } from './user-api.service';

const STORAGE_KEY = 'APP_ONBOARDING';
const EMPTY_ONBOARDING_PROFILE: OnboardingProfile = {
  condominiumId: null,
  condominiumAddress: null,
  role: null,
  onboardingCompleted: false,
};

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly userApi = inject(UserApiService);
  private readonly condominiumApi = inject(CondominiumApiService);
  private readonly errorHandler = inject(ErrorHandler);

  private readonly profileSubject = new BehaviorSubject<OnboardingProfile>(this.loadFromStorage());

  readonly profile$ = this.profileSubject.asObservable();


  constructor() {}

  get profile(): OnboardingProfile {
    return this.profileSubject.value;
  }

  get isOnboardingComplete(): boolean {
    const profile = this.profile;
    return !!(profile.condominiumAddress && profile.role && profile.onboardingCompleted);
  }

  get hasCondominium(): boolean {
    return !!this.profile.condominiumId;
  }

  get hasRole(): boolean {
    return !!this.profile.role;
  }

  get role(): UserRole | null {
    return this.profile.role;
  }

  resolveDashboardRoute(role: UserRole | null = this.profile.role): string {
    return getDashboardRouteByRole(role);
  }

  resolveNextRoute(): string {
    if (!this.hasCondominium) {
      return ROUTE_PATHS.onboardingCondominium;
    }

    if (!this.hasRole) {
      return ROUTE_PATHS.onboardingRole;
    }

    return this.resolveDashboardRoute();
  }

  syncFromBackend(): Observable<AppUserProfileDto> {
    return this.userApi.getMe().pipe(
      switchMap((user) => {
        if (user.condominiumId && !this.profile.condominiumAddress) {
          return this.condominiumApi.findOne(user.condominiumId).pipe(
            tap((condominium) => {
              this.persist(this.mapBackendProfile(user, condominium));
            }),
            map(() => user),
            catchError(() => {
              this.persist(this.mapBackendProfile(user));
              return of(user);
            }),
          );
        }

        this.persist(this.mapBackendProfile(user));
        return of(user);
      }),
      catchError((error) => {
        this.errorHandler.handleError(error);
        return of({} as AppUserProfileDto);
      }),
    );
  }

  syncAndResolveNextRoute(): Observable<string> {
    return this.syncFromBackend().pipe(
      map(() => this.resolveNextRoute()),
      catchError(() => of(this.resolveNextRoute())),
    );
  }

  saveCondominiumAddress(address: CondominiumAddress): Observable<CondominiumDto[]> {
    const zipCode = address.zipCode.replace(/\D/g, '');

    return this.condominiumApi.findByZipCode(zipCode).pipe(
      tap((existing) => {
        const condominiumId = existing.length > 0 ? existing[0].id : null;
        this.persist({
          ...this.profile,
          condominiumId,
          condominiumAddress: address,
          onboardingCompleted: !!(address && this.profile.role),
        });

        if (condominiumId) {
          this.userApi
            .updateOnboarding({ condominiumId })
            .pipe(catchError(() => of(null)))
            .subscribe();
        }
      }),
      catchError((error) => {
        this.errorHandler.handleError(error);
        this.saveLocalCondominiumAddress(address);
        return of([]);
      }),
    );
  }

  ensureCondominiumRegistration(address: CondominiumAddress): Observable<string | null> {
    return this.saveCondominiumAddress(address).pipe(
      switchMap((existing) => {
        if (existing.length > 0) {
          return of(existing[0].id);
        }

        return this.createCondominium(address).pipe(
          map((condominium) => condominium?.id ?? this.profile.condominiumId),
        );
      }),
      catchError(() => of(this.profile.condominiumId)),
    );
  }

  createCondominium(address: CondominiumAddress): Observable<CondominiumDto | null> {
    const payload: CreateCondominiumPayload = {
      name: address.name ?? `Condominio ${address.neighborhood}`,
      addressZipCode: address.zipCode.replace(/\D/g, ''),
      addressStreet: address.street,
      addressNumber: address.number,
      addressComplement: address.complement,
      addressNeighborhood: address.neighborhood,
      addressCity: address.city,
      addressState: address.state,
    };

    return this.condominiumApi.create(payload).pipe(
      tap((condominium) => {
        this.persist({
          ...this.profile,
          condominiumId: condominium.id,
          condominiumAddress: address,
          onboardingCompleted: !!(address && this.profile.role),
        });

        this.userApi
          .updateOnboarding({ condominiumId: condominium.id })
          .pipe(catchError(() => of(null)))
          .subscribe();
      }),
      catchError((error) => {
        this.errorHandler.handleError(error);
        this.saveLocalCondominiumAddress(address);
        return of(null);
      }),
    );
  }

  saveRole(role: UserRole): Observable<unknown> {
    this.persist({
      ...this.profile,
      role,
      onboardingCompleted: !!(this.profile.condominiumAddress && role),
    });

    return this.userApi.updateOnboarding({ roleInCondominium: role }).pipe(
      catchError((error) => {
        this.errorHandler.handleError(error);
        return of(null);
      }),
    );
  }

  saveLocalCondominiumAddress(
    address: CondominiumAddress,
    condominiumId = this.profile.condominiumId,
  ): void {
    this.persist({
      ...this.profile,
      condominiumId,
      condominiumAddress: address,
      onboardingCompleted: !!(address && this.profile.role),
    });
  }

  clear(): void {
    this.persist(EMPTY_ONBOARDING_PROFILE);
  }

  private mapBackendProfile(
    user: AppUserProfileDto,
    condominium?: CondominiumDto,
  ): OnboardingProfile {
    return {
      condominiumId: user.condominiumId,
      condominiumAddress: condominium
        ? {
            name: condominium.name,
            zipCode: condominium.addressZipCode,
            street: condominium.addressStreet,
            number: condominium.addressNumber,
            complement: condominium.addressComplement,
            neighborhood: condominium.addressNeighborhood,
            city: condominium.addressCity,
            state: condominium.addressState,
          }
        : user.condominiumId
          ? this.profile.condominiumAddress
          : null,
      role: user.roleInCondominium as UserRole | null,
      onboardingCompleted: user.onboardingCompleted,
    };
  }

  private persist(profile: OnboardingProfile): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } catch {
      // Ignore localStorage access errors.
    }

    this.profileSubject.next(profile);
  }

  private loadFromStorage(): OnboardingProfile {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw) as OnboardingProfile;
        }
      }
    } catch {
      // Ignore parse and storage access errors.
    }

    return EMPTY_ONBOARDING_PROFILE;
  }
}
