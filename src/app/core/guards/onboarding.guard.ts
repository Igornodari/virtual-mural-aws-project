import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

export const onboardingGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  const authenticated = await authService.isAuthenticated();
  if (!authenticated) {
    return router.parseUrl(ROUTE_PATHS.login);
  }

  const nextRoute = onboardingService.resolveNextRoute();
  return nextRoute.startsWith('/mural/') ? true : router.parseUrl(nextRoute);
};
