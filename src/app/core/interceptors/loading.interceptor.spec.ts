import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should set isLoading to true while request is in flight', () => {
    httpClient.get('/api/data').subscribe();

    expect(loadingService.isLoading()).toBe(true);
    httpMock.expectOne('/api/data').flush({});
  });

  it('should set isLoading to false after request completes', () => {
    httpClient.get('/api/data').subscribe();

    httpMock.expectOne('/api/data').flush({});
    expect(loadingService.isLoading()).toBe(false);
  });

  it('should set isLoading to false after request errors', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    httpClient.get('/api/data').subscribe({ error: () => {} });

    httpMock.expectOne('/api/data').flush('Error', { status: 500, statusText: 'Server Error' });
    expect(loadingService.isLoading()).toBe(false);
  });

  it('should not trigger loading for ViaCEP requests', () => {
    httpClient.get('https://viacep.com.br/ws/01310100/json/').subscribe();

    expect(loadingService.isLoading()).toBe(false);
    httpMock.expectOne('https://viacep.com.br/ws/01310100/json/').flush({});
    expect(loadingService.isLoading()).toBe(false);
  });

  it('should handle multiple concurrent requests', () => {
    httpClient.get('/api/first').subscribe();
    httpClient.get('/api/second').subscribe();

    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/api/first').flush({});
    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/api/second').flush({});
    expect(loadingService.isLoading()).toBe(false);
  });
});
