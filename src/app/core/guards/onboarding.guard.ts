import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

/**
 * Permite a navegação para qualquer rota dentro de /mural/* desde que o
 * usuário esteja autenticado e vinculado a um condomínio. Se faltar o
 * vínculo, redireciona para o onboarding de condomínio.
 *
 * O modelo antigo também exigia que o usuário tivesse escolhido um papel
 * (provider/customer). Esta etapa foi removida: todo usuário é morador
 * por padrão, e a ativação do modo prestador é opt-in via perfil.
 */
export const onboardingGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  const authenticated = await authService.isAuthenticated();
  if (!authenticated) {
    return router.parseUrl(ROUTE_PATHS.login);
  }

  await firstValueFrom(onboardingService.syncFromBackend());

  const nextRoute = onboardingService.resolveNextRoute();
  return nextRoute.startsWith('/mural/') ? true : router.parseUrl(nextRoute);
};
