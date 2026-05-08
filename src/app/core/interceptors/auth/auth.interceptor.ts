import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (shouldSkipAuth(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);

  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(clonedReq);
    }),
  );
};

function shouldSkipAuth(url: string): boolean {
  return (
    url.includes('/assets/') ||
    url.includes('/assets/i18n/') ||
    url.endsWith('.json')
  );
}
