import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);


  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.authService.getIdToken()).pipe(
      switchMap((idToken) => {
        const headersObj: Record<string, string> = {
          Accept: '*/*',
          'Platform-Version': environment.version ?? '0.0.1',
          'Platform-Origin': 'dashboard',
        };

        if (idToken) {
          headersObj['Authorization'] = `Bearer ${idToken}`;
        }

        const secureReq = request.clone({
          headers: new HttpHeaders(headersObj),
        });

        return next.handle(secureReq);
      }),
    );
  }
}
