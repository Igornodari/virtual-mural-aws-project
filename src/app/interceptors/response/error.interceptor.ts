import { ErrorHandler, Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandler);


  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((reqError: HttpErrorResponse) => {
        this.errorHandler.handleError(reqError);

        if (this.resolveStatusCode(reqError) === 401) {
          this.router.navigate(['/login']).then();
        }

        return throwError(() => reqError);
      }),
    );
  }

  private resolveStatusCode(reqError: HttpErrorResponse): number {
    if (reqError.status) {
      return reqError.status;
    }

    const payload = reqError.error;
    if (payload && typeof payload === 'object' && 'statusCode' in payload) {
      return Number((payload as { statusCode?: unknown }).statusCode) || 0;
    }

    return 0;
  }
}
