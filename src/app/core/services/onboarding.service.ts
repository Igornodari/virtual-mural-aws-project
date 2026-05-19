import { ErrorHandler, Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { CondominiumAddress, OnboardingProfile } from '../../shared/types';
import { getDefaultMuralRoute, ROUTE_PATHS } from '../../shared/constant/route-paths.constant';
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
  isProvider: false,
  onboardingCompleted: false,
};

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly userApi = inject(UserApiService);
  private readonly condominiumApi = inject(CondominiumApiService);
  private readonly errorHandler = inject(ErrorHandler);

  private readonly profileSubject = new BehaviorSubject<OnboardingProfile>(this.loadFromStorage());

  readonly profile$ = this.profileSubject.asObservable();

  /**
   * Cache da requisição em voo: garante que chamadas concorrentes a
   * syncFromBackend() compartilhem um único GET /users/me, evitando
   * o rate-limit que ocorre quando guards + FullComponent disparam
   * simultaneamente no mesmo ciclo de navegação.
   */
  private syncInFlight: Observable<AppUserProfileDto> | null = null;


  get profile(): OnboardingProfile {
    return this.profileSubject.value;
  }

  /**
   * O onboarding considera apenas o vínculo com um condomínio.
   * Tornar-se prestador é opt-in pós-onboarding (não trava o app).
   */
  get isOnboardingComplete(): boolean {
    return !!(this.profile.condominiumAddress && this.profile.onboardingCompleted);
  }

  get hasCondominium(): boolean {
    return !!this.profile.condominiumId;
  }

  get isProvider(): boolean {
    return this.profile.isProvider;
  }

  resolveNextRoute(): string {
    if (!this.hasCondominium) {
      return ROUTE_PATHS.onboardingCondominium;
    }

    // Todos caem no dashboard de morador por padrão. Prestadores acessam
    // a área de prestador via toggle/menu.
    return getDefaultMuralRoute();
  }

  syncFromBackend(): Observable<AppUserProfileDto> {
    // Deduplica chamadas concorrentes: guards + FullComponent disparam ao
    // mesmo tempo no mesmo ciclo de navegação. Com shareReplay(1), todos
    // recebem o mesmo resultado de um único GET /users/me.
    if (!this.syncInFlight) {
      this.syncInFlight = this.userApi.getMe().pipe(
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
          // Em caso de erro (ex: 429 rate-limit), retorna o perfil em cache
          // para não disparar fluxos que dependem de termsAcceptedAt vazio.
          const cached = this.profileSubject.value;
          return of({
            condominiumId: cached.condominiumId,
            isProvider: cached.isProvider,
            onboardingCompleted: cached.onboardingCompleted,
            termsAcceptedAt: null,
          } as AppUserProfileDto);
        }),
        shareReplay(1),
        finalize(() => { this.syncInFlight = null; }),
      );
    }

    return this.syncInFlight;
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
          onboardingCompleted: !!address,
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
          onboardingCompleted: !!address,
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

  /**
   * Ativa o modo prestador para o usuário. Idempotente.
   * Após o sucesso, o caller normalmente navega para /mural/provider,
   * onde o fluxo do Stripe Connect é apresentado se ainda não estiver
   * configurado.
   */
  activateProvider(): Observable<AppUserProfileDto | null> {
    this.persist({ ...this.profile, isProvider: true });

    return this.userApi.becomeProvider(true).pipe(
      tap((user) => {
        this.persist({
          ...this.profile,
          isProvider: user?.isProvider ?? true,
        });
      }),
      catchError((error) => {
        // Em caso de falha, reverte o estado local
        this.persist({ ...this.profile, isProvider: false });
        this.errorHandler.handleError(error);
        return of(null);
      }),
    );
  }

  /**
   * Desativa o modo prestador. Idempotente.
   * A regra de negócio (não permitir desativar se houver serviços ativos
   * ou agendamentos pendentes) é aplicada no backend.
   */
  deactivateProvider(): Observable<AppUserProfileDto | null> {
    return this.userApi.becomeProvider(false).pipe(
      tap((user) => {
        this.persist({
          ...this.profile,
          isProvider: user?.isProvider ?? false,
        });
      }),
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
      onboardingCompleted: !!address,
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
      isProvider: user.isProvider,
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
          const parsed = JSON.parse(raw) as Partial<OnboardingProfile> & {
            // Compatibilidade com profile antigo que tinha role: 'provider' | 'customer'
            role?: 'provider' | 'customer' | null;
          };
          // Migração transparente do localStorage: se vier o campo `role`
          // antigo, deriva `isProvider` a partir dele.
          const isProvider =
            typeof parsed.isProvider === 'boolean'
              ? parsed.isProvider
              : parsed.role === 'provider';
          return {
            condominiumId: parsed.condominiumId ?? null,
            condominiumAddress: parsed.condominiumAddress ?? null,
            isProvider,
            onboardingCompleted: parsed.onboardingCompleted ?? false,
          };
        }
      }
    } catch {
      // Ignore parse and storage access errors.
    }

    return EMPTY_ONBOARDING_PROFILE;
  }
}
