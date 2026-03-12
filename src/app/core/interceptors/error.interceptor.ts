import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../services/snack-bar.service';

type AwsErrorPayload = {
  __type?: string;
  message?: string | string[];
  warning?: string | string[];
  success?: string;
  successMessage?: string;
  warnings?: string[];
  errors?: Array<{ message?: string }>;
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
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
      const message = resolveErrorMessage(error, translate);
      if (resolveErrorSeverity(error) === 'warning') {
        snackBar.warning(message);
      } else {
        snackBar.error(message);
      }
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
      ? { level: 'success', message: t(translate, 'APP.FEEDBACK.SUCCESS_DEFAULT') }
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
    return { level: 'success', message: t(translate, 'APP.FEEDBACK.SUCCESS_DEFAULT') };
  }

  return null;
}

function resolveErrorMessage(error: unknown, translate: TranslateService): string {
  if (!(error instanceof HttpErrorResponse)) {
    return t(translate, 'APP.FEEDBACK.UNEXPECTED_ERROR');
  }

  if (error.status === 0) {
    return t(translate, 'APP.FEEDBACK.NETWORK_ERROR');
  }

  const payload = (error.error ?? {}) as AwsErrorPayload;
  const type = normalizeErrorType(payload.__type);
  const payloadMessage = firstMessage(payload.message);
  const firstValidationError = payload.errors?.[0]?.message?.trim();

  if (type === 'InvalidPasswordException') {
    return (
      (payloadMessage ? translateMessage(translate, payloadMessage) : null) ??
      t(translate, 'APP.FEEDBACK.INVALID_PASSWORD')
    );
  }

  if (type === 'NotAuthorizedException') {
    return payloadMessage
      ? translateMessage(translate, payloadMessage)
      : t(translate, 'APP.FEEDBACK.NOT_AUTHORIZED');
  }

  if (type === 'UserNotFoundException') {
    return payloadMessage
      ? translateMessage(translate, payloadMessage)
      : t(translate, 'APP.FEEDBACK.USER_NOT_FOUND');
  }

  if (payloadMessage) {
    return translateMessage(translate, payloadMessage);
  }

  if (firstValidationError) {
    return translateMessage(translate, firstValidationError);
  }

  if (typeof error.error === 'string' && error.error.trim()) {
    return translateMessage(translate, error.error);
  }

  if (error.message?.trim()) {
    return translateMessage(translate, error.message);
  }

  return t(translate, 'APP.FEEDBACK.REQUEST_FAILED');
}

function resolveErrorSeverity(error: unknown): 'warning' | 'error' {
  if (!(error instanceof HttpErrorResponse)) {
    return 'error';
  }

  const payload = (error.error ?? {}) as AwsErrorPayload;
  const warningMessage = firstMessage(payload.warning ?? payload.warnings);
  return warningMessage ? 'warning' : 'error';
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

function normalizeErrorType(rawType?: string): string {
  if (!rawType) return '';
  const tokens = rawType.split('#');
  return tokens[tokens.length - 1] ?? rawType;
}
