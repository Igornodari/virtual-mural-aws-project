import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { ErrorHandler, inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../services/snack-bar.service';

interface AwsErrorPayload {
  __type?: string;
  message?: string | string[];
  warning?: string | string[];
  success?: string;
  successMessage?: string;
  warnings?: string[];
  errors?: { message?: string }[];
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandler);
  const snackBar = inject(SnackBarService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    tap((event) => {
      if (!(event instanceof HttpResponse)) return;

      const feedback = resolveSuccessFeedback(event.body, req.method, translate);
      if (!feedback) return;

      if (feedback.level === 'warning') {
        snackBar.warning(feedback.message);
        return;
      }

      snackBar.success(feedback.message);
    }),
    catchError((error: unknown) => {
      errorHandler.handleError(error);
      return throwError(() => error);
    })
  );
};

function resolveSuccessFeedback(
  body: unknown,
  method: string,
  translate: TranslateService
): { level: 'success' | 'warning'; message: string } | null {
  if (!body || typeof body !== 'object') {
    return shouldShowDefaultSuccess(method)
      ? { level: 'success', message: t(translate, 'COMMON.FEEDBACK.SUCCESS') }
      : null;
  }

  const payload = body as AwsErrorPayload & Record<string, unknown>;
  const warningMessage = firstMessage(payload.warning ?? payload.warnings);
  if (warningMessage) {
    return { level: 'warning', message: translateMessage(translate, warningMessage) };
  }

  const successMessage = firstMessage(payload.successMessage ?? payload.success ?? payload.message);
  if (successMessage) {
    return { level: 'success', message: translateMessage(translate, successMessage) };
  }

  if (shouldShowDefaultSuccess(method)) {
    return { level: 'success', message: t(translate, 'COMMON.FEEDBACK.SUCCESS') };
  }

  return null;
}

function shouldShowDefaultSuccess(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function firstMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string' && item.trim().length > 0);
    return typeof first === 'string' ? first.trim() : null;
  }

  return null;
}

function translateMessage(translate: TranslateService, message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;

  const looksLikeKey = /^[A-Z0-9_.-]+$/.test(trimmed) && trimmed.includes('.');
  if (!looksLikeKey) return trimmed;

  const translated = translate.instant(trimmed);
  return translated && translated !== trimmed ? translated : trimmed;
}

function t(translate: TranslateService, key: string): string {
  const translated = translate.instant(key);
  return translated && translated !== key ? translated : key;
}

