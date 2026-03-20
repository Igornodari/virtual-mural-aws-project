import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
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

  if (!onboardingService.hasCondominium) {
    return router.parseUrl('/onboarding/condominium');
  }

  if (!onboardingService.hasRole) {
    return router.parseUrl('/onboarding/role');
  }

  return true;
};
