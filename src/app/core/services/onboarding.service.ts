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

/**
 * Serviço de onboarding.
 *
 * Estratégia de persistência:
 * 1. Lê o estado do localStorage para resposta imediata (sem flickering).
 * 2. Sincroniza com o backend via UserApiService após cada operação.
 * 3. Em caso de falha na rede, mantém o estado local para não bloquear o usuário.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly userApi = inject(UserApiService);
  private readonly condominiumApi = inject(CondominiumApiService);
  private readonly errorHandler = inject(ErrorHandler);

  private readonly profileSubject = new BehaviorSubject<OnboardingProfile>(this.loadFromStorage());

  readonly profile$ = this.profileSubject.asObservable();


  constructor() {}

  // ── Getters ──────────────────────────────────────────────────────────────

  get profile(): OnboardingProfile {
    return this.profileSubject.value;
  }

  get isOnboardingComplete(): boolean {
    const p = this.profile;
    return !!(p.condominiumAddress && p.role && p.onboardingCompleted);
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

  // ── Sincronização com o backend ──────────────────────────────────────────

  /**
   * Carrega o perfil do usuário a partir do backend e atualiza o estado local.
   * Deve ser chamado após o login para garantir sincronização.
   */
  syncFromBackend(): Observable<AppUserProfileDto> {
    return this.userApi.getMe().pipe(
      switchMap((user) => {
        // Se o backend indica que o usuário tem condomínio mas o localStorage
        // não tem o endereço (ex: primeiro acesso em outro dispositivo),
        // busca os dados do condomínio para preencher o condominiumAddress.
        if (user.condominiumId && !this.profile.condominiumAddress) {
          return this.condominiumApi.findOne(user.condominiumId).pipe(
            tap((condo: CondominiumDto) => {
              const address: CondominiumAddress = {
                name: condo.name,
                zipCode: condo.addressZipCode,
                street: condo.addressStreet,
                number: condo.addressNumber,
                complement: condo.addressComplement,
                neighborhood: condo.addressNeighborhood,
                city: condo.addressCity,
                state: condo.addressState,
              };
              const profile: OnboardingProfile = {
                condominiumId: user.condominiumId,
                condominiumAddress: address,
                role: user.roleInCondominium as UserRole | null,
                onboardingCompleted: user.onboardingCompleted,
              };
              this.persist(profile);
            }),
            catchError(() => {
              // Se falhar ao buscar o condomínio, usa o que temos
              const profile: OnboardingProfile = {
                condominiumId: user.condominiumId,
                condominiumAddress: null,
                role: user.roleInCondominium as UserRole | null,
                onboardingCompleted: user.onboardingCompleted,
              };
              this.persist(profile);
              return of(user);
            }),
            // Retorna o user original para manter o tipo do Observable
            switchMap(() => of(user)),
          );
        }

        // Estado já sincronizado ou sem condomínio: apenas atualiza
        const profile: OnboardingProfile = {
          condominiumId: user.condominiumId,
          condominiumAddress: user.condominiumId
            ? this.profile.condominiumAddress
            : null,
          role: user.roleInCondominium as UserRole | null,
          onboardingCompleted: user.onboardingCompleted,
        };
        this.persist(profile);
        return of(user);
      }),
      catchError((error) => {
        this.errorHandler.handleError(error);
        return of({} as AppUserProfileDto);
      }),
    );
  }

  /**
   * Salva o endereço do condomínio.
   * Se um condomínio com o mesmo CEP já existir no backend, vincula ao existente.
   * Caso contrário, cria um novo condomínio.
   */
  saveCondominiumAddress(address: CondominiumAddress): Observable<unknown> {
    const zipCode = address.zipCode.replace(/\D/g, '');

    return this.condominiumApi.findByZipCode(zipCode).pipe(
      tap((existing) => {
        const condominiumId = existing.length > 0 ? existing[0].id : null;

        const updated: OnboardingProfile = {
          ...this.profile,
          condominiumId,
          condominiumAddress: address,
          onboardingCompleted: !!(address && this.profile.role),
        };
        this.persist(updated);

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

  /**
   * Cria um novo condomínio no backend e vincula ao usuário.
   */
  createCondominium(address: CondominiumAddress): Observable<unknown> {
    const payload: CreateCondominiumPayload = {
      name: address.name ?? ('Condomínio ' + address.neighborhood),
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
        const updated: OnboardingProfile = {
          ...this.profile,
          condominiumId: condominium.id,
          condominiumAddress: address,
          onboardingCompleted: !!(address && this.profile.role),
        };
        this.persist(updated);

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
   * Salva a role do usuário (prestador ou morador) no backend e localmente.
   */
  saveRole(role: UserRole): Observable<unknown> {
    const updated: OnboardingProfile = {
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
    this.persist(updated);

    return this.userApi
      .updateOnboarding({ roleInCondominium: role })
      .pipe(
        catchError((err) => {
          console.warn('[OnboardingService] Erro ao salvar role no backend:', err);
          return of(null);
        }),
      );
  }

  /** Limpa o estado de onboarding (logout) */
  clear(): void {
    const empty: OnboardingProfile = {
      condominiumId: null,
      condominiumAddress: null,
      role: null,
      onboardingCompleted: false,
    };
    this.persist(empty);
  }

  // ── Persistência local ───────────────────────────────────────────────────

  private persist(profile: OnboardingProfile): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } catch {
      // Ignorar erro de localStorage (ex: modo privado)
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
    } catch {
      // Ignorar erro de parse
    }
    return empty;
  }
}
