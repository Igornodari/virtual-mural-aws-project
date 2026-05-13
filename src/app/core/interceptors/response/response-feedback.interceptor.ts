import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../../services/snack-bar.service';

interface ApiFeedbackPayload {
  message?: string | string[];
  warning?: string | string[];
  success?: string;
  successMessage?: string;
  warnings?: string[];
}

export const responseFeedbackInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(SnackBarService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    tap((event) => {
      if (!(event instanceof HttpResponse)) {
        return;
      }

      const feedback = resolveSuccessFeedback(event.body, req.method, translate);

      if (!feedback) {
        return;
      }

      if (feedback.level === 'warning') {
        snackBar.warning(feedback.message);
        return;
      }

      snackBar.success(feedback.message);
    }),
  );
};

function resolveSuccessFeedback(
  body: unknown,
  method: string,
  translate: TranslateService,
): { level: 'success' | 'warning'; message: string } | null {
  if (!body || typeof body !== 'object') {
    return shouldShowDefaultSuccess(method)
      ? {
          level: 'success',
          message: t(translate, 'COMMON.FEEDBACK.SUCCESS'),
        }
      : null;
  }

  const payload = body as ApiFeedbackPayload;

  const warningMessage = firstMessage(payload.warning ?? payload.warnings);

  if (warningMessage) {
    return {
      level: 'warning',
      message: translateMessage(translate, warningMessage),
    };
  }

  const explicitSuccessMessage = firstMessage(
    payload.successMessage ?? payload.success,
  );

  if (explicitSuccessMessage) {
    return {
      level: 'success',
      message: translateMessage(translate, explicitSuccessMessage),
    };
  }

  const methodCanShowSuccess = shouldShowDefaultSuccess(method);

  const messageFromMutation = methodCanShowSuccess
    ? firstMessage(payload.message)
    : null;

  if (messageFromMutation) {
    return {
      level: 'success',
      message: translateMessage(translate, messageFromMutation),
    };
  }

  if (methodCanShowSuccess) {
    return {
      level: 'success',
      message: t(translate, 'COMMON.FEEDBACK.SUCCESS'),
    };
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
