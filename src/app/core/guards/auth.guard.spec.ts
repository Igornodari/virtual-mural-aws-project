import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: { isAuthenticated: ReturnType<typeof vi.fn> };
  let routerSpy: { parseUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceSpy = { isAuthenticated: vi.fn() };
    routerSpy = { parseUrl: vi.fn().mockReturnValue({ toString: () => '/login' } as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should return true when user is authenticated', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );

    expect(result).toBe(true);
    expect(routerSpy.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /login when user is not authenticated', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(false);
    const loginUrlTree = { toString: () => '/login' } as UrlTree;
    routerSpy.parseUrl.mockReturnValue(loginUrlTree);

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );

    expect(result).toBe(loginUrlTree);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
  });

  it('should call isAuthenticated exactly once', async () => {
    authServiceSpy.isAuthenticated.mockResolvedValue(true);

    await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(authServiceSpy.isAuthenticated).toHaveBeenCalledTimes(1);
  });
});
