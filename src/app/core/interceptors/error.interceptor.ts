import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SnackBarService } from '../services/snack-bar.service';

type AwsErrorPayload = {
  __type?: string;
  message?: string;
  errors?: Array<{ message?: string }>;
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(SnackBarService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const message = resolveErrorMessage(error);
      snackBar.error(message);
      return throwError(() => error);
    })
  );
};

function resolveErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Unexpected error. Please try again.';
  }

  if (error.status === 0) {
    return 'Unable to connect to the server.';
  }

  const payload = (error.error ?? {}) as AwsErrorPayload;
  const type = normalizeErrorType(payload.__type);
  const payloadMessage = payload.message?.trim();
  const firstValidationError = payload.errors?.[0]?.message?.trim();

  if (type === 'InvalidPasswordException') {
    return (
      payloadMessage ??
      'Invalid password. Check uppercase, lowercase, number and special character requirements.'
    );
  }

  if (type === 'NotAuthorizedException') {
    return payloadMessage ?? 'Not authorized for this action.';
  }

  if (type === 'UserNotFoundException') {
    return payloadMessage ?? 'User not found.';
  }

  if (payloadMessage) {
    return payloadMessage;
  }

  if (firstValidationError) {
    return firstValidationError;
  }

  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  if (error.message?.trim()) {
    return error.message;
  }

  return 'Request failed. Please try again.';
}

function normalizeErrorType(rawType?: string): string {
  if (!rawType) return '';
  const tokens = rawType.split('#');
  return tokens[tokens.length - 1] ?? rawType;
}
