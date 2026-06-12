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
import { TranslateService } from '@ngx-translate/core';

import { responseFeedbackInterceptor } from './response-feedback.interceptor';
import { SnackBarService } from '../../services/snack-bar.service';

describe('responseFeedbackInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let snackBarSpy: {
    success: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
  };
  let translateSpy: { instant: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarSpy = { success: vi.fn(), warning: vi.fn() };
    translateSpy = { instant: vi.fn().mockImplementation((key: string) => key) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([responseFeedbackInterceptor])),
        provideHttpClientTesting(),
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  describe('success feedback', () => {
    it('mostra sucesso para POST com successMessage', () => {
      httpClient.post('/api/data', {}).subscribe();
      httpMock.expectOne('/api/data').flush({ successMessage: 'Item created' });
      expect(snackBarSpy.success).toHaveBeenCalledWith('Item created');
    });

    it('mostra sucesso para POST com campo success', () => {
      httpClient.post('/api/data', {}).subscribe();
      httpMock.expectOne('/api/data').flush({ success: 'Operation done' });
      expect(snackBarSpy.success).toHaveBeenCalledWith('Operation done');
    });

    it('mostra sucesso para POST com campo message', () => {
      httpClient.post('/api/data', {}).subscribe();
      httpMock.expectOne('/api/data').flush({ message: 'Record saved' });
      expect(snackBarSpy.success).toHaveBeenCalledWith('Record saved');
    });

    it('mostra sucesso padrão para POST sem campos de mensagem', () => {
      httpClient.post('/api/data', {}).subscribe();
      httpMock.expectOne('/api/data').flush({});
      expect(snackBarSpy.success).toHaveBeenCalled();
    });

    it('mostra sucesso padrão para PATCH', () => {
      httpClient.patch('/api/data', {}).subscribe();
      httpMock.expectOne('/api/data').flush({});
      expect(snackBarSpy.success).toHaveBeenCalled();
    });

    it('mostra sucesso padrão para DELETE', () => {
      httpClient.delete('/api/data').subscribe();
      httpMock.expectOne('/api/data').flush({});
      expect(snackBarSpy.success).toHaveBeenCalled();
    });

    it('NÃO mostra sucesso para GET sem campos de mensagem', () => {
      httpClient.get('/api/data').subscribe();
      httpMock.expectOne('/api/data').flush({});
      expect(snackBarSpy.success).not.toHaveBeenCalled();
    });

    it('NÃO mostra sucesso para GET com message (feedback só em mutações)', () => {
      httpClient.get('/api/data').subscribe();
      httpMock.expectOne('/api/data').flush({ message: 'Found it' });
      expect(snackBarSpy.success).not.toHaveBeenCalled();
    });
  });

  describe('warning feedback', () => {
    it('mostra warning quando há campo warning', () => {
      httpClient.post('/api/data', {}).subscribe();
      httpMock
        .expectOne('/api/data')
        .flush({ warning: 'This might be an issue' });
      expect(snackBarSpy.warning).toHaveBeenCalledWith('This might be an issue');
      expect(snackBarSpy.success).not.toHaveBeenCalled();
    });

    it('mostra warning quando há array warnings', () => {
      httpClient.post('/api/data', {}).subscribe();
      httpMock
        .expectOne('/api/data')
        .flush({ warnings: ['First warning', 'Second warning'] });
      expect(snackBarSpy.warning).toHaveBeenCalledWith('First warning');
    });
  });

  describe('tradução de mensagem', () => {
    it('traduz chaves de tradução (formato UPPER.CASE.KEY)', () => {
      translateSpy.instant.mockReturnValue('Translated message');
      httpClient.post('/api/data', {}).subscribe();
      httpMock
        .expectOne('/api/data')
        .flush({ message: 'APP.FEEDBACK.SUCCESS_DEFAULT' });
      expect(translateSpy.instant).toHaveBeenCalledWith(
        'APP.FEEDBACK.SUCCESS_DEFAULT',
      );
      expect(snackBarSpy.success).toHaveBeenCalledWith('Translated message');
    });

    it('usa a mensagem crua quando não parece uma chave', () => {
      httpClient.post('/api/data', {}).subscribe();
      httpMock
        .expectOne('/api/data')
        .flush({ message: 'Agendamento criado com sucesso' });
      expect(snackBarSpy.success).toHaveBeenCalledWith(
        'Agendamento criado com sucesso',
      );
    });
  });
});
