import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ErrorHandler } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { errorInterceptor } from './error.interceptor';
import { SnackBarService } from '../services/snack-bar.service';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let snackBarSpy: { success: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };
  let errorHandlerSpy: { handleError: ReturnType<typeof vi.fn> };
  let translateSpy: { instant: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarSpy = { success: vi.fn(), warning: vi.fn() };
    errorHandlerSpy = { handleError: vi.fn() };
    translateSpy = { instant: vi.fn().mockImplementation((key: string) => key) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: ErrorHandler, useValue: errorHandlerSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('success feedback', () => {
    it('should show success snackbar for POST response with successMessage', () => {
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({ successMessage: 'Item created' });

      expect(snackBarSpy.success).toHaveBeenCalledWith('Item created');
    });

    it('should show success snackbar for POST response with success field', () => {
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({ success: 'Operation done' });

      expect(snackBarSpy.success).toHaveBeenCalledWith('Operation done');
    });

    it('should show success snackbar for POST response with message field', () => {
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({ message: 'Record saved' });

      expect(snackBarSpy.success).toHaveBeenCalledWith('Record saved');
    });

    it('should show default success for POST response with no message fields', () => {
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({});

      expect(snackBarSpy.success).toHaveBeenCalled();
    });

    it('should show default success for PATCH response', () => {
      httpClient.patch('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({});

      expect(snackBarSpy.success).toHaveBeenCalled();
    });

    it('should show default success for DELETE response', () => {
      httpClient.delete('/api/data').subscribe();

      httpMock.expectOne('/api/data').flush({});

      expect(snackBarSpy.success).toHaveBeenCalled();
    });

    it('should NOT show success for GET response with no message fields', () => {
      httpClient.get('/api/data').subscribe();

      httpMock.expectOne('/api/data').flush({});

      expect(snackBarSpy.success).not.toHaveBeenCalled();
    });

    it('should show success from GET if response has message field', () => {
      httpClient.get('/api/data').subscribe();

      httpMock.expectOne('/api/data').flush({ message: 'Found it' });

      expect(snackBarSpy.success).toHaveBeenCalledWith('Found it');
    });
  });

  describe('warning feedback', () => {
    it('should show warning snackbar when response has warning field', () => {
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({ warning: 'This might be an issue' });

      expect(snackBarSpy.warning).toHaveBeenCalledWith('This might be an issue');
      expect(snackBarSpy.success).not.toHaveBeenCalled();
    });

    it('should show warning when warnings array is present', () => {
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({ warnings: ['First warning', 'Second warning'] });

      expect(snackBarSpy.warning).toHaveBeenCalledWith('First warning');
    });
  });

  describe('error handling', () => {
    it('should delegate errors to ErrorHandler', () => {
      httpClient.get('/api/data').subscribe({ error: () => {} });

      httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'Server Error' });

      expect(errorHandlerSpy.handleError).toHaveBeenCalled();
    });

    it('should re-throw the error after handling', () => {
      let thrownError: unknown;
      httpClient.get('/api/data').subscribe({ error: (e) => (thrownError = e) });

      httpMock.expectOne('/api/data').flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(thrownError).toBeTruthy();
    });
  });

  describe('message translation', () => {
    it('should translate translation keys (UPPER.CASE.KEY format)', () => {
      translateSpy.instant.mockReturnValue('Translated message');
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({ message: 'APP.FEEDBACK.SUCCESS_DEFAULT' });

      expect(translateSpy.instant).toHaveBeenCalledWith('APP.FEEDBACK.SUCCESS_DEFAULT');
      expect(snackBarSpy.success).toHaveBeenCalledWith('Translated message');
    });

    it('should use raw message when it does not look like a translation key', () => {
      httpClient.post('/api/data', {}).subscribe();

      httpMock.expectOne('/api/data').flush({ message: 'Agendamento criado com sucesso' });

      expect(snackBarSpy.success).toHaveBeenCalledWith('Agendamento criado com sucesso');
    });
  });
});
