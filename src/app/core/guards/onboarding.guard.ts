import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OnboardingService } from '../services/onboarding.service';

/**
 * Permite a navegação para qualquer rota dentro de /mural/* desde que o
 * usuário esteja autenticado e vinculado a um condomínio. Se faltar o
 * vínculo, redireciona para o onboarding de condomínio.
 *
 * Nota: a verificação de autenticação é feita pelo authGuard que sempre
 * precede este guard — não duplicamos a chamada isAuthenticated() aqui
 * para evitar requests concorrentes a GET /users/me que disparam o rate-limit.
 */
export const onboardingGuard: CanActivateFn = async () => {
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  await firstValueFrom(onboardingService.syncFromBackend());

  const nextRoute = onboardingService.resolveNextRoute();
  return nextRoute.startsWith('/mural/') ? true : router.parseUrl(nextRoute);
};
