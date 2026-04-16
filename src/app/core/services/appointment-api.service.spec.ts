import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentApiService, AppointmentDto, CreateAppointmentPayload } from './appointment-api.service';
import { RequestService } from './request.service';
import { environment } from 'src/environments/environments';

const BASE = environment.apiBaseUrl;

describe('AppointmentApiService', () => {
  let service: AppointmentApiService;
  let httpMock: HttpTestingController;

  const mockAppointment: AppointmentDto = {
    id: 'appt1',
    serviceId: 'svc1',
    customerId: 'cust1',
    scheduledDate: '2024-01-15',
    scheduledDay: 'monday',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RequestService,
        AppointmentApiService,
      ],
    });
    service = TestBed.inject(AppointmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should POST to /appointments with the payload', () => {
      const payload: CreateAppointmentPayload = {
        serviceId: 'svc1',
        scheduledDate: '2024-01-15',
        scheduledDay: 'monday',
        notes: 'Afternoon please',
      };

      service.create(payload).subscribe((res) => {
        expect(res).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(`${BASE}/appointments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockAppointment);
    });
  });

  describe('findMine', () => {
    it('should GET /appointments/mine', () => {
      service.findMine().subscribe((res) => {
        expect(res).toEqual([mockAppointment]);
      });

      const req = httpMock.expectOne(`${BASE}/appointments/mine`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAppointment]);
    });
  });

  describe('findByService', () => {
    it('should GET /appointments/service/:id', () => {
      service.findByService('svc1').subscribe((res) => {
        expect(res).toEqual([mockAppointment]);
      });

      const req = httpMock.expectOne(`${BASE}/appointments/service/svc1`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAppointment]);
    });

    it('should encode the service id in the URL', () => {
      service.findByService('svc-abc-123').subscribe();

      const req = httpMock.expectOne(`${BASE}/appointments/service/svc-abc-123`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('updateStatus', () => {
    it('should PATCH /appointments/:id/status with the new status', () => {
      service.updateStatus('appt1', 'confirmed').subscribe((res) => {
        expect(res.status).toBe('confirmed');
      });

      const req = httpMock.expectOne(`${BASE}/appointments/appt1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'confirmed' });
      req.flush({ ...mockAppointment, status: 'confirmed' });
    });

    it.each(['pending', 'confirmed', 'awaiting_payment', 'paid', 'cancelled', 'completed'] as const)(
      'should accept status %s',
      (status) => {
        service.updateStatus('appt1', status).subscribe();
        const req = httpMock.expectOne(`${BASE}/appointments/appt1/status`);
        expect(req.request.body).toEqual({ status });
        req.flush({ ...mockAppointment, status });
      },
    );
  });

  describe('createPayment', () => {
    it('should POST to /appointments/:id/payment with pix method', () => {
      const paymentResponse = {
        paymentId: 'pay1',
        paymentStatus: 'pending',
        qrCode: 'base64data',
        qrCodeText: 'pix-code',
        appointment: mockAppointment,
      };

      service.createPayment('appt1', { method: 'pix' }).subscribe((res) => {
        expect(res.paymentId).toBe('pay1');
        expect(res.qrCode).toBe('base64data');
      });

      const req = httpMock.expectOne(`${BASE}/appointments/appt1/payment`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ method: 'pix' });
      req.flush(paymentResponse);
    });

    it('should POST to /appointments/:id/payment with credit_card method', () => {
      const paymentResponse = {
        paymentId: 'pay2',
        paymentStatus: 'pending',
        checkoutUrl: 'https://checkout.stripe.com/session',
        appointment: mockAppointment,
      };

      service.createPayment('appt1', { method: 'credit_card' }).subscribe((res) => {
        expect(res.checkoutUrl).toBe('https://checkout.stripe.com/session');
      });

      const req = httpMock.expectOne(`${BASE}/appointments/appt1/payment`);
      expect(req.request.body).toEqual({ method: 'credit_card' });
      req.flush(paymentResponse);
    });
  });
});
