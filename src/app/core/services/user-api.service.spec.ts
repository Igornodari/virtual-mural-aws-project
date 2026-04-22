import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserApiService, AppUserProfileDto, UpdateProfilePayload, UpdateOnboardingPayload } from './user-api.service';
import { RequestService } from './request.service';
import { environment } from 'src/environments/environments';

const BASE = environment.apiBaseUrl;

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  const mockProfile: AppUserProfileDto = {
    id: 'user1',
    cognitoSub: 'cognito-sub-123',
    email: 'igor@example.com',
    givenName: 'Igor',
    familyName: 'Nodari',
    displayName: 'Igor Nodari',
    phone: '11999998888',
    condominiumId: 'condo1',
    roleInCondominium: 'provider',
    onboardingCompleted: true,
    addressCompleted: true,
    roleCompleted: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RequestService,
        UserApiService,
      ],
    });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMe', () => {
    it('should GET /users/me', () => {
      service.getMe().subscribe((res) => {
        expect(res).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${BASE}/users/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('updateOnboarding', () => {
    it('should PATCH /users/me/onboarding with condominiumId', () => {
      const payload: UpdateOnboardingPayload = { condominiumId: 'condo1' };

      service.updateOnboarding(payload).subscribe((res) => {
        expect(res).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${BASE}/users/me/onboarding`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(mockProfile);
    });

    it('should PATCH /users/me/onboarding with roleInCondominium', () => {
      const payload: UpdateOnboardingPayload = { roleInCondominium: 'customer' };

      service.updateOnboarding(payload).subscribe((res) => {
        expect(res.roleInCondominium).toBe('customer');
      });

      const req = httpMock.expectOne(`${BASE}/users/me/onboarding`);
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockProfile, roleInCondominium: 'customer' });
    });

    it('should PATCH /users/me/onboarding with both fields', () => {
      const payload: UpdateOnboardingPayload = {
        condominiumId: 'condo2',
        roleInCondominium: 'provider',
      };

      service.updateOnboarding(payload).subscribe();

      const req = httpMock.expectOne(`${BASE}/users/me/onboarding`);
      expect(req.request.body).toEqual(payload);
      req.flush(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should PATCH /users/me/profile with name fields', () => {
      const payload: UpdateProfilePayload = {
        givenName: 'João',
        familyName: 'Silva',
      };

      service.updateProfile(payload).subscribe((res) => {
        expect(res.givenName).toBe('João');
      });

      const req = httpMock.expectOne(`${BASE}/users/me/profile`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush({ ...mockProfile, givenName: 'João' });
    });

    it('should PATCH /users/me/profile with phone', () => {
      const payload: UpdateProfilePayload = { phone: '11988887777' };

      service.updateProfile(payload).subscribe();

      const req = httpMock.expectOne(`${BASE}/users/me/profile`);
      expect(req.request.body).toEqual(payload);
      req.flush(mockProfile);
    });

    it('should PATCH /users/me/profile with avatarUrl', () => {
      const payload: UpdateProfilePayload = { avatarUrl: 'https://cdn.example.com/avatar.jpg' };

      service.updateProfile(payload).subscribe();

      const req = httpMock.expectOne(`${BASE}/users/me/profile`);
      expect(req.request.body).toEqual(payload);
      req.flush(mockProfile);
    });
  });
});
