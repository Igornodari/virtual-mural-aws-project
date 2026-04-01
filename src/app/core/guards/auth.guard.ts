import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authenticated = await authService.isAuthenticated();

  if (authenticated) return true;

  return router.parseUrl(ROUTE_PATHS.login);
};
