import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { QueryParams, RequestService } from './request.service';

/**
 * Facade de API do mural.
 * Mantem os services de dominio desacoplados do HttpClient e reutiliza o RequestService
 * como cliente HTTP base da aplicacao.
 */
@Injectable({ providedIn: 'root' })
export class MuralApiService {
  private readonly request = inject(RequestService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.request.get<T>(path, { params });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.request.post<T, unknown>(path, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.request.patchPath<T, unknown>(path, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.request.deletePath<T>(path);
  }
}
