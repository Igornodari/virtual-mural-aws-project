import { HttpInterceptorFn } from '@angular/common/http';

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  if (shouldSkipRequestHeaders(req.url)) {
    return next(req);
  }

  const clonedReq = req.clone({
    setHeaders: {
      Accept: '*/*',
    },
  });

  return next(clonedReq);
};

function shouldSkipRequestHeaders(url: string): boolean {
  return (
    url.includes('/assets/') ||
    url.includes('/assets/i18n/') ||
    url.endsWith('.json')
  );
}
