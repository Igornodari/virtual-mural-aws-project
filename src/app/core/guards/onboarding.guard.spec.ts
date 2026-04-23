import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { onboardingGuard } from './onboarding.guard';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

describe('onboardingGuard', () => {
  let authServiceSpy: { isAuthenticated: ReturnType<typeof vi.fn> };
  let onboardingServiceSpy: {
    syncFromBackend: ReturnType<typeof vi.fn>;
    resolveNextRoute: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { parseUrl: ReturnType<typeof vi.fn> };

  function makeUrlTree(path: string): UrlTree {
    return { toString: () => path } as UrlTree;
  }

  beforeEach(() => {
    authServiceSpy = { isAuthenticated: vi.fn() };
    onboardingServiceSpy = {
      syncFromBackend: vi.fn().mockReturnValue(of({})),
      resolveNextRoute: vi.fn(),
    };
    routerSpy = { parseUrl: vi.fn().mockImplementation((path: string) => makeUrlTree(path)) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OnboardingService, useValue: onboardingServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should redirect to /login when user is not authenticated', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(false);

    const result = await TestBed.runInInjectionContext(() =>
      onboardingGuard({} as any, {} as any),
    );

    const tree = result as UrlTree;
    expect(tree.toString()).toBe(ROUTE_PATHS.login);
    expect(onboardingServiceSpy.syncFromBackend).not.toHaveBeenCalled();
  });

  it('should return true when user is authenticated and route is a mural route', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(true);
    onboardingServiceSpy.resolveNextRoute.mockReturnValue(ROUTE_PATHS.muralProvider);

    const result = await TestBed.runInInjectionContext(() =>
      onboardingGuard({} as any, {} as any),
    );

    expect(result).toBe(true);
  });

  it('should return true for /mural/customer route', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(true);
    onboardingServiceSpy.resolveNextRoute.mockReturnValue(ROUTE_PATHS.muralCustomer);

    const result = await TestBed.runInInjectionContext(() =>
      onboardingGuard({} as any, {} as any),
    );

    expect(result).toBe(true);
  });

  it('should redirect to onboarding condominium when onboarding is incomplete', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(true);
    onboardingServiceSpy.resolveNextRoute.mockReturnValue(ROUTE_PATHS.onboardingCondominium);

    const result = await TestBed.runInInjectionContext(() =>
      onboardingGuard({} as any, {} as any),
    );

    const tree = result as UrlTree;
    expect(tree.toString()).toBe(ROUTE_PATHS.onboardingCondominium);
  });

  it('should redirect to onboarding role when condominium is set but role is missing', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(true);
    onboardingServiceSpy.resolveNextRoute.mockReturnValue(ROUTE_PATHS.onboardingRole);

    const result = await TestBed.runInInjectionContext(() =>
      onboardingGuard({} as any, {} as any),
    );

    const tree = result as UrlTree;
    expect(tree.toString()).toBe(ROUTE_PATHS.onboardingRole);
  });

  it('should call syncFromBackend before resolving route', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(true);
    onboardingServiceSpy.resolveNextRoute.mockReturnValue(ROUTE_PATHS.muralProvider);

    await TestBed.runInInjectionContext(() => onboardingGuard({} as any, {} as any));

    expect(onboardingServiceSpy.syncFromBackend).toHaveBeenCalledTimes(1);
    expect(onboardingServiceSpy.resolveNextRoute).toHaveBeenCalledTimes(1);
  });
});
