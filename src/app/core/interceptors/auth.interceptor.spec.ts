import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: { getIdToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceSpy = { getIdToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token is available', async () => {
    authServiceSpy.getIdToken.mockReturnValue(Promise.resolve('test-jwt-token'));

    httpClient.get('/api/test').subscribe();
    await flushPromises();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('should not add Authorization header when token is null', async () => {
    authServiceSpy.getIdToken.mockReturnValue(Promise.resolve(null));

    httpClient.get('/api/test').subscribe();
    await flushPromises();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should use Bearer scheme in Authorization header', async () => {
    authServiceSpy.getIdToken.mockReturnValue(Promise.resolve('my-token-123'));

    httpClient.get('/api/data').subscribe();
    await flushPromises();

    const req = httpMock.expectOne('/api/data');
    const auth = req.request.headers.get('Authorization');
    expect(auth).not.toBeNull();
    expect(auth!.startsWith('Bearer ')).toBe(true);
    req.flush({});
  });

  it('should forward request without header when token is empty string', async () => {
    authServiceSpy.getIdToken.mockReturnValue(Promise.resolve(''));

    httpClient.get('/api/test').subscribe();
    await flushPromises();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
