import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environments';
import { BRASIL_API } from '../../shared/constant/path.contant';
import { ActivityLog, ListResponse } from '../../shared/types';

export type ApiTarget = 'CORE' | 'BRASIL_API';
export type QueryValue =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface RequestOptions {
  api?: ApiTarget;
  search?: Record<string, unknown>;
  params?: QueryParams;
  relations?: Record<string, unknown>;
}

export interface BodyRequestOptions extends RequestOptions {
  type?: 'multipart/form-data';
}

interface HttpRequestOptions<TBody = unknown> extends BodyRequestOptions {
  body?: TBody;
}

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly http = inject(HttpClient);

  private readonly apiRoots: Record<ApiTarget, string> = {
    CORE: environment.apiBaseUrl,
    BRASIL_API,
  };


  constructor() {}

  request<TResponse, TBody = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options: HttpRequestOptions<TBody> = {},
  ): Observable<TResponse> {
    const body = this.resolveBody(options.body, options.type);

    return this.http.request<TResponse>(method, this.buildUrl(path, options.api), {
      body,
      params: this.buildParams(options),
    });
  }

  get<TResponse>(path: string, options: RequestOptions = {}): Observable<TResponse> {
    return this.request<TResponse>('GET', path, options);
  }

  list<T>(path: string, options: RequestOptions = {}): Observable<ListResponse<T>> {
    return this.get<ListResponse<T>>(path, options);
  }

  show<TResponse>(
    path: string,
    id: string | number,
    options: RequestOptions = {},
  ): Observable<TResponse> {
    return this.get<TResponse>(this.joinPath(path, id), options);
  }

  post<TResponse = unknown, TPayload = unknown>(
    path: string,
    payload: TPayload,
    options: BodyRequestOptions = {},
  ): Observable<TResponse> {
    return this.request<TResponse, TPayload>('POST', path, { ...options, body: payload });
  }

  put<TResponse = unknown, TPayload = unknown>(
    path: string,
    payload: TPayload,
    options: BodyRequestOptions = {},
  ): Observable<TResponse> {
    return this.request<TResponse, TPayload>('PUT', path, { ...options, body: payload });
  }

  update<TResponse = unknown, TPayload = Partial<TResponse>>(
    path: string,
    id: string | number,
    payload: TPayload,
    options: BodyRequestOptions = {},
  ): Observable<TResponse> {
    return this.put<TResponse, TPayload>(this.joinPath(path, id), payload, options);
  }

  patchPath<TResponse = unknown, TPayload = unknown>(
    path: string,
    payload: TPayload,
    options: BodyRequestOptions = {},
  ): Observable<TResponse> {
    return this.request<TResponse, TPayload>('PATCH', path, { ...options, body: payload });
  }

  patch<TResponse = unknown, TPayload = Partial<TResponse>>(
    path: string,
    id: string | number,
    payload: TPayload,
    options: BodyRequestOptions = {},
  ): Observable<TResponse> {
    return this.patchPath<TResponse, TPayload>(this.joinPath(path, id), payload, options);
  }

  deletePath<TResponse = unknown>(
    path: string,
    options: HttpRequestOptions = {},
  ): Observable<TResponse> {
    return this.request<TResponse>('DELETE', path, options);
  }

  delete<TResponse = unknown>(
    path: string,
    id: string | number,
    body?: unknown,
  ): Observable<TResponse> {
    return this.deletePath<TResponse>(this.joinPath(path, id), { body });
  }

  download(path: string, options: RequestOptions = {}): Observable<Blob> {
    return this.http.get(this.buildUrl(path, options.api), {
      params: this.buildParams(options),
      responseType: 'blob',
    });
  }

  getActivities(
    path: string,
    id: string | number,
    option = { visibility: ['public', 'internal'] },
  ): Observable<ActivityLog[]> {
    return this.list<ActivityLog>('core/activity-log', {
      search: {
        tableId: id,
        table: path,
        visibility: ['in', option.visibility],
      },
    }).pipe(map((data) => data.data));
  }

  private buildUrl(path: string, api: ApiTarget = 'CORE'): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const base = this.apiRoots[api].replace(/\/$/, '');
    const normalizedPath = path.replace(/^\//, '');

    return `${base}/${normalizedPath}`;
  }

  private joinPath(path: string, id: string | number): string {
    return `${path.replace(/\/$/, '')}/${id}`;
  }

  private buildParams(options: RequestOptions): HttpParams {
    let params = new HttpParams();
    const requestParams: QueryParams = {
      ...this.serializeJsonParam('search', options.search),
      ...this.serializeJsonParam('relations', options.relations),
      ...options.params,
    };

    Object.entries(requestParams).forEach(([key, value]) => {
      params = this.appendParam(params, key, value);
    });

    return params;
  }

  private appendParam(params: HttpParams, key: string, value: QueryValue): HttpParams {
    if (value === null || value === undefined) {
      return params;
    }

    if (Array.isArray(value)) {
      return value.reduce((nextParams, item) => nextParams.append(key, String(item)), params);
    }

    return params.set(key, String(value));
  }

  private serializeJsonParam(
    key: 'search' | 'relations',
    value: Record<string, unknown> | undefined,
  ): QueryParams {
    return value && Object.keys(value).length ? { [key]: JSON.stringify(value) } : {};
  }

  private resolveBody<TBody>(
    body: TBody | undefined,
    type: BodyRequestOptions['type'],
  ): TBody | FormData | undefined {
    if (type !== 'multipart/form-data' || body === undefined) {
      return body;
    }

    return this.multipartFormData(body);
  }

  private multipartFormData(data: unknown): FormData {
    const payload = new FormData();

    if (!data || typeof data !== 'object') {
      return payload;
    }

    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => this.appendFormDataValue(payload, key, item));
        return;
      }

      this.appendFormDataValue(payload, key, value);
    });

    return payload;
  }

  private appendFormDataValue(payload: FormData, key: string, value: unknown): void {
    if (value instanceof Blob) {
      payload.append(key, value);
      return;
    }

    if (typeof value === 'boolean') {
      payload.append(key, value ? '1' : '0');
      return;
    }

    payload.append(key, String(value));
  }
}
