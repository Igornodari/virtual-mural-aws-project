import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ServiceApiService, ServiceDto, CreateServicePayload, ServiceAnalyticsDto } from './service-api.service';
import { RequestService } from './request.service';
import { environment } from 'src/environments/environments';

const BASE = environment.apiBaseUrl;

describe('ServiceApiService', () => {
  let service: ServiceApiService;
  let httpMock: HttpTestingController;

  const mockService: ServiceDto = {
    id: 'svc1',
    name: 'Corte de Cabelo',
    description: 'Corte masculino e feminino',
    price: '50.00',
    contact: '11999998888',
    category: 'hair',
    availableDays: ['monday', 'wednesday', 'friday'],
    rating: 4.5,
    totalReviews: 10,
    isActive: true,
    providerId: 'prov1',
    condominiumId: 'condo1',
    clicks: 20,
    interests: 8,
    completions: 5,
    abandonments: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RequestService,
        ServiceApiService,
      ],
    });
    service = TestBed.inject(ServiceApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should GET /services', () => {
      service.findAll().subscribe((res) => {
        expect(res).toEqual([mockService]);
      });

      const req = httpMock.expectOne(`${BASE}/services`);
      expect(req.request.method).toBe('GET');
      req.flush([mockService]);
    });
  });

  describe('findMine', () => {
    it('should GET /services with mine=true param', () => {
      service.findMine().subscribe((res) => {
        expect(res).toEqual([mockService]);
      });

      const req = httpMock.expectOne((r) => r.url === `${BASE}/services` && r.params.get('mine') === 'true');
      expect(req.request.method).toBe('GET');
      req.flush([mockService]);
    });
  });

  describe('findOne', () => {
    it('should GET /services/:id', () => {
      service.findOne('svc1').subscribe((res) => {
        expect(res).toEqual(mockService);
      });

      const req = httpMock.expectOne(`${BASE}/services/svc1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockService);
    });
  });

  describe('getProviderAnalytics', () => {
    it('should GET /services/analytics/me', () => {
      const mockAnalytics: ServiceAnalyticsDto[] = [
        {
          serviceId: 'svc1',
          serviceName: 'Corte de Cabelo',
          clicks: 20,
          interests: 8,
          completions: 5,
          abandonments: 3,
          rating: 4.5,
          totalReviews: 10,
          ratingDistribution: { 5: 6, 4: 3, 3: 1 },
          recentComments: [],
        },
      ];

      service.getProviderAnalytics().subscribe((res) => {
        expect(res).toEqual(mockAnalytics);
      });

      const req = httpMock.expectOne(`${BASE}/services/analytics/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAnalytics);
    });
  });

  describe('getAnalytics', () => {
    it('should GET /services/:id/analytics', () => {
      const mockAnalytics: ServiceAnalyticsDto = {
        serviceId: 'svc1',
        serviceName: 'Corte de Cabelo',
        clicks: 20,
        interests: 8,
        completions: 5,
        abandonments: 3,
        rating: 4.5,
        totalReviews: 10,
        ratingDistribution: {},
        recentComments: [],
      };

      service.getAnalytics('svc1').subscribe((res) => {
        expect(res).toEqual(mockAnalytics);
      });

      const req = httpMock.expectOne(`${BASE}/services/svc1/analytics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAnalytics);
    });
  });

  describe('create', () => {
    it('should POST to /services with the payload', () => {
      const payload: CreateServicePayload = {
        name: 'Corte de Cabelo',
        description: 'Corte masculino e feminino',
        price: '50.00',
        contact: '11999998888',
        category: 'hair',
        availableDays: ['monday', 'friday'],
      };

      service.create(payload).subscribe((res) => {
        expect(res).toEqual(mockService);
      });

      const req = httpMock.expectOne(`${BASE}/services`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockService);
    });
  });

  describe('update', () => {
    it('should PATCH /services/:id with the payload', () => {
      const payload = { name: 'Corte Atualizado', price: '60.00' };

      service.update('svc1', payload).subscribe((res) => {
        expect(res.name).toBe('Corte Atualizado');
      });

      const req = httpMock.expectOne(`${BASE}/services/svc1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockService, ...payload });
    });
  });

  describe('remove', () => {
    it('should DELETE /services/:id', () => {
      service.remove('svc1').subscribe();

      const req = httpMock.expectOne(`${BASE}/services/svc1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('trackMetric', () => {
    it.each(['clicks', 'interests', 'completions', 'abandonments'] as const)(
      'should PATCH /services/:id/track/%s',
      (metric) => {
        service.trackMetric('svc1', metric).subscribe();

        const req = httpMock.expectOne(`${BASE}/services/svc1/track/${metric}`);
        expect(req.request.method).toBe('PATCH');
        req.flush(null);
      },
    );
  });
});
