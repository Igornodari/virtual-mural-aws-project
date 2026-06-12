import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Injector, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalErrorHandler } from './global-error.handler';
import { SnackBarService } from '../services/snack-bar.service';
import { SentryReporter } from '../reporters/sentry.reporter';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let captureSpy: ReturnType<typeof vi.spyOn>;
  let snackBarSpy: { error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };
  let translateSpy: { instant: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarSpy = { error: vi.fn(), warning: vi.fn() };
    translateSpy = { instant: vi.fn().mockImplementation((key: string) => key) };

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    handler = TestBed.inject(GlobalErrorHandler);
    captureSpy = vi
      .spyOn(SentryReporter, 'capture')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    SentryReporter._reset();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('Sentry capture', () => {
    it('should capture generic JS errors in Sentry', () => {
      const error = new Error('Something broke');
      handler.handleError(error);
      expect(captureSpy).toHaveBeenCalledWith(error);
    });

    it('should capture 500 HttpErrorResponse in Sentry', () => {
      const error = new HttpErrorResponse({ status: 500, url: '/api/test' });
      handler.handleError(error);
      expect(captureSpy).toHaveBeenCalledWith(error);
    });

    it('should capture 503 HttpErrorResponse in Sentry', () => {
      const error = new HttpErrorResponse({ status: 503, url: '/api/test' });
      handler.handleError(error);
      expect(captureSpy).toHaveBeenCalledWith(error);
    });

    it('should capture network errors (status 0) in Sentry', () => {
      const error = new HttpErrorResponse({ status: 0, url: '/api/test' });
      handler.handleError(error);
      expect(captureSpy).toHaveBeenCalledWith(error);
    });

    it('should NOT capture 400 client errors in Sentry', () => {
      const error = new HttpErrorResponse({ status: 400, url: '/api/test' });
      handler.handleError(error);
      expect(captureSpy).not.toHaveBeenCalled();
    });

    it('should NOT capture 401 errors in Sentry', () => {
      const error = new HttpErrorResponse({ status: 401, url: '/api/test' });
      handler.handleError(error);
      expect(captureSpy).not.toHaveBeenCalled();
    });

    it('should NOT capture 404 errors in Sentry', () => {
      const error = new HttpErrorResponse({ status: 404, url: '/api/test' });
      handler.handleError(error);
      expect(captureSpy).not.toHaveBeenCalled();
    });

    it('should NOT capture 422 validation errors in Sentry', () => {
      const error = new HttpErrorResponse({ status: 422, url: '/api/test' });
      handler.handleError(error);
      expect(captureSpy).not.toHaveBeenCalled();
    });
  });

  describe('Duplicate handling', () => {
    it('should not capture the same error twice in Sentry', () => {
      const error = new Error('duplicate');
      handler.handleError(error);
      handler.handleError(error);
      expect(captureSpy).toHaveBeenCalledTimes(1);
    });
  });
});
