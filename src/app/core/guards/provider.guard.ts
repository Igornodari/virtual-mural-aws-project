import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { OnboardingService } from '../services/onboarding.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

/**
 * Guarda a área de prestador: só permite a navegação se o usuário tiver
 * ativado o modo prestador (`isProvider === true`). Caso contrário,
 * redireciona para o dashboard de morador com um snackbar indicando que
 * o modo prestador precisa ser ativado pelo perfil.
 */
export const providerGuard: CanActivateFn = async () => {
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const translate = inject(TranslateService);

  // Garante que temos o estado mais atual do backend antes de bloquear.
  // O onboardingGuard global já roda antes, mas refazemos defensivamente
  // para o caso de o usuário ter ativado/desativado o modo prestador em
  // outra aba.
  if (!onboardingService.isProvider) {
    await firstValueFrom(onboardingService.syncFromBackend());
  }

  if (onboardingService.isProvider) {
    return true;
  }

  const message = translate.instant('PROVIDER_GUARD.NEEDS_ACTIVATION');
  snackBar.open(
    typeof message === 'string' && message !== 'PROVIDER_GUARD.NEEDS_ACTIVATION'
      ? message
      : 'Ative o modo prestador no seu perfil para acessar esta área.',
    'OK',
    { duration: 4000 },
  );

  return router.parseUrl(ROUTE_PATHS.muralCustomer);
};
