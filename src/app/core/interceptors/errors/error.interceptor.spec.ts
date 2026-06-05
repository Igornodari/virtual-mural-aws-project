import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ErrorHandler } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { errorInterceptor } from './error.interceptor';
import { SnackBarService } from '../../services/snack-bar.service';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let snackBarSpy: { error: ReturnType<typeof vi.fn> };
  let errorHandlerSpy: { handleError: ReturnType<typeof vi.fn> };
  let translateSpy: { instant: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarSpy = { error: vi.fn() };
    errorHandlerSpy = { handleError: vi.fn() };
    translateSpy = { instant: vi.fn().mockImplementation((key: string) => key) };
    routerSpy = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: ErrorHandler, useValue: errorHandlerSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('delega o erro ao ErrorHandler', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    httpClient.get('/api/data').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/data')
      .flush('Error', { status: 500, statusText: 'Server Error' });
    expect(errorHandlerSpy.handleError).toHaveBeenCalled();
  });

  it('re-lança o erro após tratar', () => {
    let thrownError: unknown;
    httpClient.get('/api/data').subscribe({ error: (e) => (thrownError = e) });
    httpMock
      .expectOne('/api/data')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(thrownError).toBeTruthy();
  });

  it('exibe snackbar de erro com a mensagem do payload', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    httpClient.get('/api/data').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/data')
      .flush(
        { message: 'Falha ao processar' },
        { status: 400, statusText: 'Bad Request' },
      );
    expect(snackBarSpy.error).toHaveBeenCalledWith('Falha ao processar');
  });

  it('redireciona para /login em 401 sem exibir snackbar de erro', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    httpClient.get('/api/data').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/data')
      .flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(snackBarSpy.error).not.toHaveBeenCalled();
  });

  it('traduz a mensagem de erro quando ela é uma chave i18n', () => {
    translateSpy.instant.mockReturnValue('Mensagem traduzida');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    httpClient.get('/api/data').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/data')
      .flush(
        { message: 'COMMON.FEEDBACK.ERROR' },
        { status: 400, statusText: 'Bad Request' },
      );
    expect(translateSpy.instant).toHaveBeenCalledWith('COMMON.FEEDBACK.ERROR');
    expect(snackBarSpy.error).toHaveBeenCalledWith('Mensagem traduzida');
  });
});
