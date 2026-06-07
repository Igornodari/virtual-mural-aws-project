/**
 * Testes do FullComponent (layout shell principal).
 *
 * Foco:
 *  - Inicialização de userName e isProvider a partir dos streams
 *  - Computed activeMode ('provider' | 'customer')
 *  - Abertura do modal de termos quando termsAcceptedAt é nulo
 *  - Ações do modal: aceitar → registra no backend; recusar → logout
 *  - onLogout()
 *  - dashboardLink() conforme activeMode
 *  - Detecção de rota /mural/provider
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, BehaviorSubject } from 'rxjs';

import { FullComponent } from './full.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { PushSubscriptionService } from 'src/app/core/services/push-subscription.service';
import { UserApiService, AppUserProfileDto } from 'src/app/core/services/user-api.service';
import { CondominiumApiService } from 'src/app/core/services/condominium-api.service';
import { ServiceApiService } from 'src/app/core/services/service-api.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProfile(overrides: Partial<AppUserProfileDto> = {}): AppUserProfileDto {
  return {
    id: 'u1',
    cognitoSub: 'sub-1',
    email: 'test@example.com',
    givenName: 'Igor',
    familyName: 'Leal',
    displayName: 'Igor Leal',
    condominiumId: 'condo-1',
    isProvider: false,
    onboardingCompleted: true,
    addressCompleted: true,
    termsAcceptedAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeDialogRef(result: string | undefined) {
  return {
    afterClosed: vi.fn().mockReturnValue(of(result)),
  } as unknown as MatDialogRef<unknown, string>;
}

// ── Fábrica de TestBed ────────────────────────────────────────────────────────

function setup(options: {
  termsAcceptedAt?: string | null;
  isProvider?: boolean;
  routerUrl?: string;
  /** Resultado que o dialog de termos retorna ao fechar ('accepted' | 'declined' | undefined) */
  dialogResult?: string;
} = {}) {
  const {
    termsAcceptedAt = '2026-01-01T00:00:00Z',
    isProvider = false,
    routerUrl = '/mural/customer',
    dialogResult = undefined,
  } = options;

  // Perfil sem termos aceitos (trigger do dialog) e com termos aceitos (stop do loop)
  const profileWithoutTerms = makeProfile({ termsAcceptedAt: undefined, isProvider });
  const profileWithTerms = makeProfile({ termsAcceptedAt: '2026-01-01T00:00:00Z', isProvider });
  const profile = (termsAcceptedAt === null || termsAcceptedAt === undefined)
    ? profileWithoutTerms
    : makeProfile({ termsAcceptedAt, isProvider });

  // Subjects para controlar emissões
  const userSubject = new BehaviorSubject({ givenName: 'Igor', displayName: 'Igor Leal' });
  const profileSubject = new BehaviorSubject({ isProvider });
  const routerEvents$ = new Subject<NavigationEnd>();

  const authServiceSpy = {
    $user: userSubject.asObservable(),
    $condominium: of(null),
    logout: vi.fn(),
  };

  const onboardingServiceSpy = {
    profile$: profileSubject.asObservable(),
    // Primeira chamada retorna o perfil configurado; chamadas subsequentes retornam com termos
    // aceitos para evitar loop infinito no modal
    syncFromBackend: vi.fn()
      .mockReturnValueOnce(of(profile))
      .mockReturnValue(of(profileWithTerms)),
  };

  const pushServiceSpy = {
    detect: vi.fn().mockResolvedValue(undefined),
  };

  const userApiSpy = {
    acceptTerms: vi.fn().mockReturnValue(of(profileWithTerms)),
    getMe: vi.fn().mockReturnValue(of(profileWithTerms)),
  };

  // MatDialogModule (via importBase) registra MatDialog no injector do componente,
  // então um override por DI não alcança a instância usada. Espionamos o protótipo,
  // que cobre qualquer instância de MatDialog injetada.
  const dialogOpenSpy = vi
    .spyOn(MatDialog.prototype, 'open')
    .mockReturnValue(
      makeDialogRef(dialogResult) as unknown as ReturnType<MatDialog['open']>,
    );
  const dialogSpy = { open: dialogOpenSpy };

  const routerSpy = {
    url: routerUrl,
    navigate: vi.fn().mockResolvedValue(true),
    navigateByUrl: vi.fn().mockResolvedValue(true),
    events: routerEvents$.asObservable(),
  };

  const breakpointSpy = {
    observe: vi.fn().mockReturnValue(of({ matches: false } as BreakpointState)),
  };

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideAnimationsAsync(),
      { provide: AuthService, useValue: authServiceSpy },
      { provide: OnboardingService, useValue: onboardingServiceSpy },
      { provide: PushSubscriptionService, useValue: pushServiceSpy },
      { provide: UserApiService, useValue: userApiSpy },
      { provide: CondominiumApiService, useValue: {} },
      { provide: ServiceApiService, useValue: {} },
      { provide: SnackBarService, useValue: { success: vi.fn(), error: vi.fn() } },
      { provide: Router, useValue: routerSpy },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      { provide: BreakpointObserver, useValue: breakpointSpy },
    ],
  });

  const fixture = TestBed.createComponent(FullComponent);
  const comp = fixture.componentInstance;

  return {
    comp,
    fixture,
    authServiceSpy,
    onboardingServiceSpy,
    pushServiceSpy,
    userApiSpy,
    dialogSpy,
    routerSpy,
    profileSubject,
    userSubject,
    routerEvents$,
  };
}

// ── Suíte ─────────────────────────────────────────────────────────────────────

describe('FullComponent', () => {
  afterEach(() => vi.restoreAllMocks());

  it('deve estar definido', () => {
    const { comp } = setup();
    expect(comp).toBeTruthy();
  });

  // ── Inicialização ─────────────────────────────────────────────────────────

  describe('inicialização', () => {
    it('deve definir userName a partir de givenName do AuthService.$user', () => {
      const { comp } = setup();
      expect(comp.userName()).toBe('Igor');
    });

    it('deve usar displayName quando givenName não está disponível', () => {
      const { comp, userSubject } = setup();
      userSubject.next({ givenName: '', displayName: 'Igor Leal' });
      expect(comp.userName()).toBe('Igor Leal');
    });

    it('deve definir isProvider a partir do profile$ do OnboardingService', () => {
      const { comp } = setup({ isProvider: true });
      expect(comp.isProvider()).toBe(true);
    });

    it('deve chamar syncFromBackend na inicialização', () => {
      const { onboardingServiceSpy } = setup();
      expect(onboardingServiceSpy.syncFromBackend).toHaveBeenCalled();
    });

    it('deve chamar pushService.detect na inicialização', () => {
      const { pushServiceSpy } = setup();
      expect(pushServiceSpy.detect).toHaveBeenCalled();
    });
  });

  // ── Modal de termos ───────────────────────────────────────────────────────

  describe('modal de termos de uso', () => {
    it('NÃO deve abrir o modal quando termsAcceptedAt está preenchido', () => {
      const { dialogSpy } = setup({ termsAcceptedAt: '2026-01-01T00:00:00Z' });
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('deve abrir o modal quando termsAcceptedAt é nulo', () => {
      // setup() com termsAcceptedAt=null faz syncFromBackend retornar perfil sem termos
      // → o componente detecta !termsAcceptedAt e abre o dialog via dialogSpy
      const { dialogSpy } = setup({ termsAcceptedAt: null });
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('deve chamar userApi.acceptTerms e syncFromBackend quando usuario aceita', () => {
      const { userApiSpy, onboardingServiceSpy } = setup({
        termsAcceptedAt: null,
        dialogResult: 'accepted',
      });
      expect(userApiSpy.acceptTerms).toHaveBeenCalled();
      // boot + após aceite
      expect(onboardingServiceSpy.syncFromBackend).toHaveBeenCalledTimes(2);
    });

    it('deve chamar logout e navegar para login quando usuario recusa os termos', () => {
      const { authServiceSpy, routerSpy } = setup({
        termsAcceptedAt: null,
        dialogResult: 'declined',
      });
      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith([ROUTE_PATHS.login]);
    });
  });

  // ── activeMode ────────────────────────────────────────────────────────────

  describe('activeMode (computed signal)', () => {
    it('deve retornar "customer" quando isProvider=false', () => {
      const { comp } = setup({ isProvider: false });
      expect(comp.activeMode()).toBe('customer');
    });

    it('deve retornar "customer" quando isProvider=true mas rota não é /mural/provider', () => {
      const { comp } = setup({ isProvider: true, routerUrl: '/mural/customer' });
      comp.isProviderRouteActive.set(false);
      expect(comp.activeMode()).toBe('customer');
    });

    it('deve retornar "provider" quando isProvider=true e rota é /mural/provider', () => {
      const { comp } = setup({ isProvider: true, routerUrl: '/mural/provider' });
      comp.isProvider.set(true);
      comp.isProviderRouteActive.set(true);
      expect(comp.activeMode()).toBe('provider');
    });
  });

  // ── dashboardLink ─────────────────────────────────────────────────────────

  describe('dashboardLink()', () => {
    it('deve retornar link do customer quando activeMode é customer', () => {
      const { comp } = setup({ isProvider: false });
      expect(comp.dashboardLink()).toBe(ROUTE_PATHS.muralCustomer);
    });

    it('deve retornar link do provider quando activeMode é provider', () => {
      const { comp } = setup({ isProvider: true });
      comp.isProviderRouteActive.set(true);
      expect(comp.dashboardLink()).toBe(ROUTE_PATHS.muralProvider);
    });
  });

  // ── onLogout ──────────────────────────────────────────────────────────────

  describe('onLogout()', () => {
    it('deve chamar authService.logout e navegar para /login', () => {
      const { comp, authServiceSpy, routerSpy } = setup();
      comp.onLogout();
      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith([ROUTE_PATHS.login]);
    });
  });

  // ── isMobile ──────────────────────────────────────────────────────────────

  describe('isMobile (breakpoint)', () => {
    it('deve definir isMobile=true quando viewport é menor que 768px', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideAnimationsAsync(),
          { provide: AuthService, useValue: { $user: of({ givenName: 'Igor', displayName: '' }), $condominium: of(null), logout: vi.fn() } },
          { provide: OnboardingService, useValue: { profile$: of({ isProvider: false }), syncFromBackend: vi.fn().mockReturnValue(of(makeProfile())) } },
          { provide: PushSubscriptionService, useValue: { detect: vi.fn().mockResolvedValue(undefined) } },
          { provide: UserApiService, useValue: { acceptTerms: vi.fn().mockReturnValue(of({})) } },
          { provide: MatDialog, useValue: { open: vi.fn() } },
          { provide: Router, useValue: { url: '/', navigate: vi.fn(), navigateByUrl: vi.fn(), events: of() } },
          { provide: BreakpointObserver, useValue: { observe: vi.fn().mockReturnValue(of({ matches: true } as BreakpointState)) } },
          { provide: CondominiumApiService, useValue: {} },
          { provide: ServiceApiService, useValue: {} },
          { provide: SnackBarService, useValue: { success: vi.fn(), error: vi.fn() } },
          { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        ],
        imports: [TranslateModule.forRoot()],
      });
      const comp = TestBed.createComponent(FullComponent).componentInstance;
      expect(comp.isMobile()).toBe(true);
    });
  });

  // ── Detecção de rota ─────────────────────────────────────────────────────

  describe('isProviderRouteActive', () => {
    it('deve ser true quando URL inicial é /mural/provider', () => {
      const { comp } = setup({ routerUrl: '/mural/provider' });
      expect(comp.isProviderRouteActive()).toBe(true);
    });

    it('deve ser false quando URL inicial é /mural/customer', () => {
      const { comp } = setup({ routerUrl: '/mural/customer' });
      expect(comp.isProviderRouteActive()).toBe(false);
    });

    it('deve atualizar isProviderRouteActive quando NavigationEnd emite nova rota', () => {
      const { comp, routerEvents$ } = setup({ routerUrl: '/mural/customer' });
      expect(comp.isProviderRouteActive()).toBe(false);

      const navEnd = new NavigationEnd(1, '/mural/provider', '/mural/provider');
      routerEvents$.next(navEnd);

      expect(comp.isProviderRouteActive()).toBe(true);
    });
  });
});
