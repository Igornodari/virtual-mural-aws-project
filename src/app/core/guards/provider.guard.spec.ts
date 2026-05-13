import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { providerGuard } from './provider.guard';
import { OnboardingService } from '../services/onboarding.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

describe('providerGuard', () => {
  let onboardingSpy: {
    isProvider: boolean;
    syncFromBackend: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { parseUrl: ReturnType<typeof vi.fn> };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };
  let translateSpy: { instant: ReturnType<typeof vi.fn> };

  function makeUrlTree(path: string): UrlTree {
    return { toString: () => path } as UrlTree;
  }

  beforeEach(() => {
    onboardingSpy = {
      isProvider: false,
      syncFromBackend: vi.fn().mockReturnValue(of({})),
    };
    routerSpy = {
      parseUrl: vi
        .fn()
        .mockImplementation((path: string) => makeUrlTree(path)),
    };
    snackBarSpy = { open: vi.fn() };
    translateSpy = { instant: vi.fn().mockReturnValue('Ative o modo prestador') };

    TestBed.configureTestingModule({
      providers: [
        { provide: OnboardingService, useValue: onboardingSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });
  });

  it('permite acesso direto quando isProvider já está true (sem sync)', async () => {
    onboardingSpy.isProvider = true;

    const result = await TestBed.runInInjectionContext(() =>
      providerGuard({} as any, {} as any),
    );

    expect(result).toBe(true);
    // Sync só roda quando isProvider é false (otimização)
    expect(onboardingSpy.syncFromBackend).not.toHaveBeenCalled();
  });

  it('força sync do backend antes de bloquear quando isProvider=false (cobre race entre abas)', async () => {
    onboardingSpy.isProvider = false;

    await TestBed.runInInjectionContext(() =>
      providerGuard({} as any, {} as any),
    );

    expect(onboardingSpy.syncFromBackend).toHaveBeenCalledTimes(1);
  });

  it('permite acesso quando o sync confirma que virou prestador em outra aba', async () => {
    // Antes do sync, local diz false; o sync atualiza para true
    onboardingSpy.isProvider = false;
    onboardingSpy.syncFromBackend.mockImplementation(() => {
      onboardingSpy.isProvider = true;
      return of({});
    });

    const result = await TestBed.runInInjectionContext(() =>
      providerGuard({} as any, {} as any),
    );

    expect(result).toBe(true);
  });

  it('redireciona para /mural/customer e mostra snackbar quando o usuário não é prestador', async () => {
    onboardingSpy.isProvider = false;

    const result = await TestBed.runInInjectionContext(() =>
      providerGuard({} as any, {} as any),
    );

    expect(snackBarSpy.open).toHaveBeenCalled();
    const tree = result as UrlTree;
    expect(tree.toString()).toBe(ROUTE_PATHS.muralCustomer);
  });

  it('usa o texto da chave de tradução quando ela está configurada', async () => {
    onboardingSpy.isProvider = false;
    translateSpy.instant.mockReturnValue('Texto traduzido');

    await TestBed.runInInjectionContext(() =>
      providerGuard({} as any, {} as any),
    );

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Texto traduzido',
      expect.anything(),
      expect.any(Object),
    );
  });

  it('cai pro texto fallback quando o translate retorna a chave (i18n quebrado)', async () => {
    onboardingSpy.isProvider = false;
    translateSpy.instant.mockReturnValue('PROVIDER_GUARD.NEEDS_ACTIVATION');

    await TestBed.runInInjectionContext(() =>
      providerGuard({} as any, {} as any),
    );

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      expect.stringContaining('Ative o modo prestador'),
      expect.anything(),
      expect.any(Object),
    );
  });
});
