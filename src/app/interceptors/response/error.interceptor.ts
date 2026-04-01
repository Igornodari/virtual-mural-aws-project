import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

type AwsErrorPayload = {
  __type?: string;
  message?: string;
  statusCode?: number;
  errors?: Array<{ message?: string }>;
};

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router, private readonly snackBar: SnackBarService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((reqError: HttpErrorResponse) => {
        const statusCode = reqError.status || (reqError.error as AwsErrorPayload)?.statusCode;
        const message = this.resolveMessage(reqError);

        if (statusCode === 401) {
          this.snackBar.error('Session expired. Please log in again.');
          this.router.navigateByUrl(ROUTE_PATHS.login).then();
        } else {
          this.snackBar.error(message);
        }

        return throwError(() => reqError);
      })
    );
  }

  private resolveMessage(reqError: HttpErrorResponse): string {
    if (reqError.status === 0) {
      return 'Unable to connect to the server.';
    }

    const payload = (reqError.error ?? {}) as AwsErrorPayload;
    const type = this.normalizeType(payload.__type);
    const payloadMessage = payload.message?.trim();
    const nestedMessage = payload.errors?.[0]?.message?.trim();

    if (type === 'InvalidPasswordException') {
      return (
        payloadMessage ??
        'Password did not conform with policy. Please check password requirements.'
      );
    }

    if (type === 'NotAuthorizedException') {
      return payloadMessage ?? 'Not authorized for this action.';
    }

    if (payloadMessage) {
      return payloadMessage;
    }

    if (nestedMessage) {
      return nestedMessage;
    }

    if (typeof reqError.error === 'string' && reqError.error.trim()) {
      return reqError.error;
    }

    return reqError.message || 'Request failed. Please try again.';
  }

  private normalizeType(rawType?: string): string {
    if (!rawType) return '';
    const parts = rawType.split('#');
    return parts[parts.length - 1] ?? rawType;
  }
}
