import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { OnboardingService } from '../services/onboarding.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

/**
 * Guarda a área de prestador: só permite a navegação se o usuário tiver
 * ativado o modo prestador (`isProvider === true`). Caso contrário,
 * redireciona para o dashboard de morador com um snackbar informativo.
 *
 * Nota: o onboardingGuard sempre precede este guard e já chamou
 * syncFromBackend(), portanto o perfil local já está sincronizado —
 * não repetimos a chamada ao backend para evitar requests redundantes.
 */
export const providerGuard: CanActivateFn = () => {
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const translate = inject(TranslateService);

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
