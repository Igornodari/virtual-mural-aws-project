import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';

/**
 * Guard que garante que o usuário autenticado passou pelo onboarding completo.
 * Caso contrário, redireciona para a etapa pendente.
 */
export const onboardingGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  const authenticated = await authService.isAuthenticated();
  if (!authenticated) {
    return router.parseUrl('/login');
  }

  await firstValueFrom(onboardingService.syncFromBackend());
  const nextRoute = onboardingService.resolveNextRoute();
  return nextRoute.startsWith('/mural/') ? true : router.parseUrl(nextRoute);
};
