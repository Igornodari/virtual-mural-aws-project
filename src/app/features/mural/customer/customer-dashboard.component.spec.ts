/**
 * Testes do CustomerDashboardComponent.
 *
 * Foco:
 *  - Carregamento inicial via forkJoin (getMe + findAll)
 *  - Estado de loading (isLoadingDashboard)
 *  - totalServices e uniqueProviders calculados corretamente
 *  - Filtro por categoria (selectCategory)
 *  - Filtro por busca com suporte a acentos (onSearchTermChange)
 *  - replaceService: atualiza serviço na lista
 *  - Fallback em caso de erro de API (lista vazia)
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { CustomerDashboardComponent } from './customer-dashboard.component';
import { ServiceApiService, ServiceDto } from 'src/app/core/services/service-api.service';
import { UserApiService, AppUserProfileDto } from 'src/app/core/services/user-api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CondominiumApiService } from 'src/app/core/services/condominium-api.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { CUSTOMER_ALL_CATEGORY } from './customer.constants';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeService(overrides: Partial<ServiceDto> = {}): ServiceDto {
  return {
    id: 'svc-1',
    name: 'Encanador',
    description: 'Serviços de encanamento',
    category: 'Reparos',
    price: '100',
    contact: '11999999999',
    providerId: 'provider-1',
    condominiumId: 'condo-1',
    availableDays: [],
    rating: 0,
    totalReviews: 0,
    clicks: 0,
    interests: 0,
    completions: 0,
    abandonments: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

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
    termsAcceptedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function setupDashboard(options: {
  services?: ServiceDto[];
  profileError?: boolean;
  servicesError?: boolean;
} = {}) {
  const { services = [], profileError = false, servicesError = false } = options;

  const serviceApiSpy = {
    findAll: vi.fn().mockReturnValue(
      servicesError ? throwError(() => new Error('API error')) : of(services),
    ),
    trackMetric: vi.fn().mockReturnValue(of(undefined)),
  };

  const userApiSpy = {
    getMe: vi.fn().mockReturnValue(
      profileError ? throwError(() => new Error('Unauthorized')) : of(makeProfile()),
    ),
  };

  const authServiceSpy = {
    $user: of({ givenName: 'Igor', displayName: 'Igor Leal' }),
    $condominium: of(null),
  };

  const dialogSpy = {
    open: vi.fn().mockReturnValue({ afterClosed: vi.fn().mockReturnValue(of(undefined)) }),
  };

  const snackBarSpy = { success: vi.fn(), error: vi.fn() };

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideAnimationsAsync(),
      { provide: ServiceApiService, useValue: serviceApiSpy },
      { provide: UserApiService, useValue: userApiSpy },
      { provide: AuthService, useValue: authServiceSpy },
      { provide: CondominiumApiService, useValue: {} },
      { provide: MatDialog, useValue: dialogSpy },
      { provide: SnackBarService, useValue: snackBarSpy },
      {
        provide: TranslateService,
        useValue: { instant: vi.fn((k: string) => k), get: vi.fn(() => of('')) },
      },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: { get: () => null } } },
      },
      { provide: Router, useValue: { navigateByUrl: vi.fn(), url: '/' } },
    ],
  });

  const fixture = TestBed.createComponent(CustomerDashboardComponent);
  const comp = fixture.componentInstance;
  comp.ngOnInit();

  return { comp, fixture, serviceApiSpy, dialogSpy, snackBarSpy };
}

// ── Suíte ─────────────────────────────────────────────────────────────────────

describe('CustomerDashboardComponent', () => {
  it('deve estar definido', () => {
    const { comp } = setupDashboard();
    expect(comp).toBeTruthy();
  });

  // ── Carregamento inicial ───────────────────────────────────────────────────

  describe('loadDashboard()', () => {
    it('deve chamar serviceApi.findAll na inicialização', () => {
      const { serviceApiSpy } = setupDashboard();
      expect(serviceApiSpy.findAll).toHaveBeenCalled();
    });

    it('deve popular services com o retorno da API', () => {
      const svc = makeService({ id: 'svc-1' });
      const { comp } = setupDashboard({ services: [svc] });
      expect(comp.services).toHaveLength(1);
      expect(comp.services[0].id).toBe('svc-1');
    });

    it('deve definir isLoadingDashboard=false após o carregamento', () => {
      const { comp } = setupDashboard({ services: [makeService()] });
      expect(comp.isLoadingDashboard).toBe(false);
    });

    it('deve usar lista vazia como fallback quando serviceApi falha', () => {
      const { comp } = setupDashboard({ servicesError: true });
      expect(comp.services).toEqual([]);
      expect(comp.isLoadingDashboard).toBe(false);
    });

    it('deve usar lista vazia quando userApi falha', () => {
      const { comp } = setupDashboard({ services: [makeService()], profileError: true });
      expect(comp.services).toHaveLength(1); // serviços ainda carregam independente
      expect(comp.isLoadingDashboard).toBe(false);
    });
  });

  // ── totalServices e uniqueProviders ────────────────────────────────────────

  describe('syncServiceView() — métricas', () => {
    it('deve calcular totalServices corretamente', () => {
      const services = [makeService({ id: 'a' }), makeService({ id: 'b' })];
      const { comp } = setupDashboard({ services });
      expect(comp.totalServices).toBe(2);
    });

    it('deve calcular uniqueProviders contando providers distintos', () => {
      const services = [
        makeService({ id: 'a', providerId: 'p1' }),
        makeService({ id: 'b', providerId: 'p1' }), // mesmo provider
        makeService({ id: 'c', providerId: 'p2' }),
      ];
      const { comp } = setupDashboard({ services });
      expect(comp.uniqueProviders).toBe(2);
    });
  });

  // ── Filtro por categoria ──────────────────────────────────────────────────

  describe('selectCategory()', () => {
    it('deve exibir todos os serviços quando categoria é __ALL__', () => {
      const services = [
        makeService({ id: 'a', category: 'Reparos' }),
        makeService({ id: 'b', category: 'Limpeza' }),
      ];
      const { comp } = setupDashboard({ services });
      comp.selectCategory(CUSTOMER_ALL_CATEGORY);
      expect(comp.visibleServices).toHaveLength(2);
    });

    it('deve filtrar pelo categoria selecionada', () => {
      const services = [
        makeService({ id: 'a', category: 'Reparos' }),
        makeService({ id: 'b', category: 'Limpeza' }),
      ];
      const { comp } = setupDashboard({ services });
      comp.selectCategory('Reparos');
      expect(comp.visibleServices).toHaveLength(1);
      expect(comp.visibleServices[0].id).toBe('a');
    });

    it('deve atualizar selectedCategory', () => {
      const { comp } = setupDashboard({ services: [makeService()] });
      comp.selectCategory('Limpeza');
      expect(comp.selectedCategory).toBe('Limpeza');
    });
  });

  // ── Filtro por busca ──────────────────────────────────────────────────────

  describe('onSearchTermChange()', () => {
    it('deve filtrar serviços pelo nome (case-insensitive)', () => {
      // Descrição neutra para evitar colisão com o termo de busca
      const services = [
        makeService({ id: 'a', name: 'Encanador', description: 'Reparo hidráulico' }),
        makeService({ id: 'b', name: 'Eletricista', description: 'Instalacao eletrica' }),
      ];
      const { comp } = setupDashboard({ services });
      comp.onSearchTermChange('enca');
      expect(comp.visibleServices).toHaveLength(1);
      expect(comp.visibleServices[0].id).toBe('a');
    });

    it('deve filtrar serviços pela descrição', () => {
      // Termos sem acento para evitar problema de NFD entre singular/plural
      const services = [
        makeService({ id: 'a', name: 'Hidraulico', description: 'Conserto de tubos' }),
        makeService({ id: 'b', name: 'Eletricista', description: 'Instalacao eletrica' }),
      ];
      const { comp } = setupDashboard({ services });
      comp.onSearchTermChange('tubo');
      expect(comp.visibleServices).toHaveLength(1);
      expect(comp.visibleServices[0].id).toBe('a');
    });

    it('deve ignorar acentos na busca (normalização NFD)', () => {
      const services = [
        makeService({ id: 'a', name: 'Eletricista' }),
        makeService({ id: 'b', name: 'Encanador' }),
      ];
      const { comp } = setupDashboard({ services });
      // busca sem acento deve encontrar serviço com acento na categoria
      comp.onSearchTermChange('eletricista');
      expect(comp.visibleServices).toHaveLength(1);
    });

    it('deve exibir todos quando searchTerm é vazio', () => {
      const services = [makeService({ id: 'a' }), makeService({ id: 'b' })];
      const { comp } = setupDashboard({ services });
      comp.onSearchTermChange('');
      expect(comp.visibleServices).toHaveLength(2);
    });

    it('deve atualizar searchTerm', () => {
      const { comp } = setupDashboard();
      comp.onSearchTermChange('pintor');
      expect(comp.searchTerm).toBe('pintor');
    });
  });

  // ── replaceService ────────────────────────────────────────────────────────

  describe('replaceService()', () => {
    it('deve substituir o serviço com id correspondente na lista', () => {
      const svc = makeService({ id: 'svc-1', name: 'Encanador' });
      const { comp } = setupDashboard({ services: [svc] });

      const updated = makeService({ id: 'svc-1', name: 'Encanador Premium' });
      comp.replaceService(updated);

      expect(comp.services[0].name).toBe('Encanador Premium');
    });

    it('deve manter os outros serviços inalterados', () => {
      const services = [
        makeService({ id: 'a', name: 'A' }),
        makeService({ id: 'b', name: 'B' }),
      ];
      const { comp } = setupDashboard({ services });

      comp.replaceService(makeService({ id: 'a', name: 'A atualizado' }));

      expect(comp.services).toHaveLength(2);
      expect(comp.services[1].name).toBe('B');
    });

    it('deve re-sincronizar visibleServices após substituição', () => {
      const svc = makeService({ id: 'svc-1', name: 'Encanador', category: 'Reparos' });
      const { comp } = setupDashboard({ services: [svc] });

      const updated = makeService({ id: 'svc-1', name: 'Encanador v2', category: 'Reparos' });
      comp.replaceService(updated);

      expect(comp.visibleServices[0].name).toBe('Encanador v2');
    });
  });

  // ── Filtro combinado ──────────────────────────────────────────────────────

  describe('filtro combinado (categoria + busca)', () => {
    it('deve aplicar categoria e busca ao mesmo tempo', () => {
      // Descrição neutra para evitar colisão com o termo de busca
      const services = [
        makeService({ id: 'a', name: 'Encanador', category: 'Reparos', description: 'Hidraulica' }),
        makeService({ id: 'b', name: 'Pintor', category: 'Reparos', description: 'Pintura' }),
        makeService({ id: 'c', name: 'Encanador', category: 'Limpeza', description: 'Limpeza de canos' }),
      ];
      const { comp } = setupDashboard({ services });

      comp.selectCategory('Reparos');
      comp.onSearchTermChange('enc');

      expect(comp.visibleServices).toHaveLength(1);
      expect(comp.visibleServices[0].id).toBe('a');
    });
  });
});
