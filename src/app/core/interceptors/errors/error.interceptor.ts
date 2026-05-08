import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { ErrorHandler, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../../services/snack-bar.service';

interface ApiErrorPayload {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  errors?: { message?: string }[];
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const errorHandler = inject(ErrorHandler);
  const snackBar = inject(SnackBarService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: unknown) => {
      errorHandler.handleError(error);

      if (!(error instanceof HttpErrorResponse)) {
        snackBar.error(t(translate, 'COMMON.FEEDBACK.ERROR'));
        return throwError(() => error);
      }

      const statusCode = resolveStatusCode(error);

      if (statusCode === 401) {
        router.navigate(['/login']).then();
        return throwError(() => error);
      }

      const message = resolveErrorMessage(error, translate);

      snackBar.error(message);

      return throwError(() => error);
    }),
  );
};

function resolveStatusCode(error: HttpErrorResponse): number {
  if (error.status) {
    return error.status;
  }

  const payload = error.error;

  if (payload && typeof payload === 'object' && 'statusCode' in payload) {
    return Number((payload as ApiErrorPayload).statusCode) || 0;
  }

  return 0;
}

function resolveErrorMessage(
  error: HttpErrorResponse,
  translate: TranslateService,
): string {
  const payload = error.error as ApiErrorPayload | string | null;

  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === 'object') {
    const fromMessage = firstMessage(payload.message);

    if (fromMessage) {
      return translateMessage(translate, fromMessage);
    }

    const fromErrors = firstMessage(
      payload.errors
        ?.map((item) => item.message)
        .filter(Boolean),
    );

    if (fromErrors) {
      return translateMessage(translate, fromErrors);
    }

    if (typeof payload.error === 'string' && payload.error.trim()) {
      return translateMessage(translate, payload.error);
    }
  }

  if (error.message) {
    return error.message;
  }

  return t(translate, 'COMMON.FEEDBACK.ERROR');
}

function firstMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const first = value.find(
      (item) => typeof item === 'string' && item.trim().length > 0,
    );

    return typeof first === 'string' ? first.trim() : null;
  }

  return null;
}

function translateMessage(translate: TranslateService, message: string): string {
  const trimmed = message.trim();

  if (!trimmed) {
    return trimmed;
  }

  const looksLikeKey = /^[A-Z0-9_.-]+$/.test(trimmed) && trimmed.includes('.');

  if (!looksLikeKey) {
    return trimmed;
  }

  const translated = translate.instant(trimmed);

  return translated && translated !== trimmed ? translated : trimmed;
}

function t(translate: TranslateService, key: string): string {
  const translated = translate.instant(key);

  return translated && translated !== key ? translated : key;
}
