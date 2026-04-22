import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector, NgZone, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../core/services/snack-bar.service';

interface AwsErrorPayload {
  __type?: string;
  message?: string | string[];
  warning?: string | string[];
  warnings?: string[];
  statusCode?: number;
  errors?: { message?: string }[];
}

const HANDLED_BY_GLOBAL_ERROR_HANDLER = Symbol('HANDLED_BY_GLOBAL_ERROR_HANDLER');

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);
  private ngZone = inject(NgZone);

  private readonly handledErrors = new WeakSet<object>();


  constructor() {}

  handleError(error: unknown): void {
    const normalizedError = this.unwrapError(error);

    if (this.wasHandled(normalizedError)) {
      return;
    }

    this.markAsHandled(normalizedError);

    if (this.isChunkLoadError(normalizedError)) {
      window.location.reload();
      return;
    }

    const snackBar = this.injector.get(SnackBarService);
    const translate = this.injector.get(TranslateService);
    const message = this.resolveMessage(normalizedError, translate);
    const severity = this.resolveSeverity(normalizedError);

    this.ngZone.run(() => {
      if (severity === 'warning') {
        snackBar.warning(message);
        return;
      }

      snackBar.error(message);
    });
  }

  private unwrapError(error: unknown): unknown {
    if (error && typeof error === 'object' && 'rejection' in error) {
      return (error as { rejection?: unknown }).rejection ?? error;
    }

    return error;
  }

  private wasHandled(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    return (
      this.handledErrors.has(error) ||
      Boolean((error as Record<PropertyKey, unknown>)[HANDLED_BY_GLOBAL_ERROR_HANDLER])
    );
  }

  private markAsHandled(error: unknown): void {
    if (!error || typeof error !== 'object') {
      return;
    }

    try {
      this.handledErrors.add(error);
      Object.defineProperty(error, HANDLED_BY_GLOBAL_ERROR_HANDLER, {
        value: true,
        configurable: true,
      });
    } catch {
      // Alguns erros podem estar congelados pelo runtime.
    }
  }

  private isChunkLoadError(error: unknown): boolean {
    const message = this.getMessage(error);
    return message.includes('ChunkLoadError') || message.includes('Loading chunk');
  }

  private resolveMessage(error: unknown, translate: TranslateService): string {
    if (!(error instanceof HttpErrorResponse)) {
      const message = this.getMessage(error);
      return message
        ? this.translateMessage(translate, message)
        : this.t(translate, 'APP.FEEDBACK.UNEXPECTED_ERROR');
    }

    if (error.status === 0) {
      return this.t(translate, 'APP.FEEDBACK.NETWORK_ERROR');
    }

    const payload = this.asErrorPayload(error.error);
    const type = this.normalizeErrorType(payload.__type);
    const warningMessage = this.firstMessage(payload.warning ?? payload.warnings);
    const payloadMessage = this.firstMessage(payload.message);
    const firstValidationError = payload.errors?.[0]?.message?.trim();

    if (warningMessage) {
      return this.translateMessage(translate, warningMessage);
    }

    if (type === 'InvalidPasswordException') {
      return (
        (payloadMessage ? this.translateMessage(translate, payloadMessage) : null) ??
        this.t(translate, 'APP.FEEDBACK.INVALID_PASSWORD')
      );
    }

    if (type === 'NotAuthorizedException') {
      return payloadMessage
        ? this.translateMessage(translate, payloadMessage)
        : this.t(translate, 'APP.FEEDBACK.NOT_AUTHORIZED');
    }

    if (type === 'UserNotFoundException') {
      return payloadMessage
        ? this.translateMessage(translate, payloadMessage)
        : this.t(translate, 'APP.FEEDBACK.USER_NOT_FOUND');
    }

    if (payloadMessage) {
      return this.translateMessage(translate, payloadMessage);
    }

    if (firstValidationError) {
      return this.translateMessage(translate, firstValidationError);
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return this.translateMessage(translate, error.error);
    }

    if (error.message?.trim()) {
      return this.translateMessage(translate, error.message);
    }

    return this.t(translate, 'APP.FEEDBACK.REQUEST_FAILED');
  }

  private resolveSeverity(error: unknown): 'warning' | 'error' {
    if (!(error instanceof HttpErrorResponse)) {
      return 'error';
    }

    const payload = this.asErrorPayload(error.error);
    const warningMessage = this.firstMessage(payload.warning ?? payload.warnings);
    return warningMessage ? 'warning' : 'error';
  }

  private asErrorPayload(value: unknown): AwsErrorPayload {
    return value && typeof value === 'object' ? (value as AwsErrorPayload) : {};
  }

  private getMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      return typeof message === 'string' ? message : '';
    }

    return typeof error === 'string' ? error : '';
  }

  private firstMessage(value: unknown): string | null {
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

  private translateMessage(translate: TranslateService, message: string): string {
    const trimmed = message.trim();
    if (!trimmed) return trimmed;

    const looksLikeKey = /^[A-Z0-9_.-]+$/.test(trimmed) && trimmed.includes('.');
    if (!looksLikeKey) return trimmed;

    const translated = translate.instant(trimmed);
    return translated && translated !== trimmed ? translated : trimmed;
  }

  private t(translate: TranslateService, key: string): string {
    const translated = translate.instant(key);
    return translated && translated !== key ? translated : key;
  }

  private normalizeErrorType(rawType?: string): string {
    if (!rawType) return '';
    const tokens = rawType.split('#');
    return tokens[tokens.length - 1] ?? rawType;
  }
}
