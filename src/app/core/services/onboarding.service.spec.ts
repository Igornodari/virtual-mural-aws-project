import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OnboardingService } from './onboarding.service';
import { UserApiService, AppUserProfileDto } from './user-api.service';
import { CondominiumApiService, CondominiumDto } from './condominium-api.service';
import { ROUTE_PATHS } from '../../shared/constant/route-paths.constant';

const mockProfile: AppUserProfileDto = {
  id: 'user1',
  cognitoSub: 'sub-123',
  email: 'igor@example.com',
  givenName: 'Igor',
  familyName: 'Nodari',
  displayName: 'Igor Nodari',
  condominiumId: null,
  roleInCondominium: null,
  onboardingCompleted: false,
  addressCompleted: false,
  roleCompleted: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockCondominium: CondominiumDto = {
  id: 'condo1',
  name: 'Condomínio Bela Vista',
  addressZipCode: '01310100',
  addressStreet: 'Av. Paulista',
  addressNumber: '1000',
  addressNeighborhood: 'Bela Vista',
  addressCity: 'São Paulo',
  addressState: 'SP',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('OnboardingService', () => {
  let service: OnboardingService;
  let userApiSpy: { getMe: ReturnType<typeof vi.fn>; updateOnboarding: ReturnType<typeof vi.fn> };
  let condominiumApiSpy: {
    findOne: ReturnType<typeof vi.fn>;
    findByZipCode: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();

    userApiSpy = {
      getMe: vi.fn().mockReturnValue(of(mockProfile)),
      updateOnboarding: vi.fn().mockReturnValue(of(mockProfile)),
    };

    condominiumApiSpy = {
      findOne: vi.fn().mockReturnValue(of(mockCondominium)),
      findByZipCode: vi.fn().mockReturnValue(of([])),
      create: vi.fn().mockReturnValue(of(mockCondominium)),
    };

    TestBed.configureTestingModule({
      providers: [
        OnboardingService,
        { provide: UserApiService, useValue: userApiSpy },
        { provide: CondominiumApiService, useValue: condominiumApiSpy },
      ],
    });
    service = TestBed.inject(OnboardingService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with empty profile when localStorage is empty', () => {
      expect(service.isOnboardingComplete).toBe(false);
      expect(service.hasCondominium).toBe(false);
      expect(service.hasRole).toBe(false);
      expect(service.role).toBeNull();
    });
  });

  const mockAddress = {
    zipCode: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  };

  describe('resolveNextRoute', () => {
    it('should return onboarding condominium when no condominium set', () => {
      expect(service.resolveNextRoute()).toBe(ROUTE_PATHS.onboardingCondominium);
    });

    it('should return onboarding role when condominium is set but no role', () => {
      service.saveLocalCondominiumAddress(mockAddress, 'condo1');
      expect(service.resolveNextRoute()).toBe(ROUTE_PATHS.onboardingRole);
    });

    it('should return provider dashboard when role is provider', () => {
      service['persist']({ condominiumId: 'condo1', condominiumAddress: mockAddress, role: 'provider', onboardingCompleted: true });
      expect(service.resolveNextRoute()).toBe(ROUTE_PATHS.muralProvider);
    });

    it('should return customer dashboard when role is customer', () => {
      service['persist']({ condominiumId: 'condo1', condominiumAddress: mockAddress, role: 'customer', onboardingCompleted: true });
      expect(service.resolveNextRoute()).toBe(ROUTE_PATHS.muralCustomer);
    });
  });

  describe('saveRole', () => {
    it('should update profile role synchronously', () => {
      service.saveRole('provider').subscribe();
      expect(service.role).toBe('provider');
      expect(service.hasRole).toBe(true);
    });

    it('should call updateOnboarding on the user API', () => {
      service.saveRole('customer').subscribe();
      expect(userApiSpy.updateOnboarding).toHaveBeenCalledWith({ roleInCondominium: 'customer' });
    });

    it('should complete even when the API call fails', () => {
      userApiSpy.updateOnboarding.mockReturnValue(throwError(() => new Error('Network error')));
      let completed = false;
      service.saveRole('provider').subscribe({ complete: () => (completed = true) });
      expect(completed).toBe(true);
      expect(service.role).toBe('provider');
    });
  });

  describe('syncFromBackend', () => {
    it('should update profile with backend data (no condominium)', () => {
      userApiSpy.getMe.mockReturnValue(
        of({ ...mockProfile, condominiumId: null, roleInCondominium: null }),
      );

      service.syncFromBackend().subscribe();
      expect(service.hasCondominium).toBe(false);
      expect(service.role).toBeNull();
    });

    it('should fetch condominium when user has condominiumId but no local address', () => {
      userApiSpy.getMe.mockReturnValue(
        of({ ...mockProfile, condominiumId: 'condo1', roleInCondominium: 'provider' }),
      );

      service.syncFromBackend().subscribe();

      expect(condominiumApiSpy.findOne).toHaveBeenCalledWith('condo1');
      expect(service.hasCondominium).toBe(true);
      expect(service.role).toBe('provider');
    });

    it('should not fetch condominium when local address already exists', () => {
      service.saveLocalCondominiumAddress(mockAddress, 'condo1');

      userApiSpy.getMe.mockReturnValue(
        of({ ...mockProfile, condominiumId: 'condo1', roleInCondominium: 'provider' }),
      );

      service.syncFromBackend().subscribe();
      expect(condominiumApiSpy.findOne).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', () => {
      userApiSpy.getMe.mockReturnValue(throwError(() => new Error('Unauthorized')));
      let completed = false;
      service.syncFromBackend().subscribe({ complete: () => (completed = true) });
      expect(completed).toBe(true);
    });
  });

  describe('clear', () => {
    it('should reset profile to empty state', () => {
      service['persist']({ ...service.profile, role: 'provider' });
      expect(service.role).toBe('provider');

      service.clear();
      expect(service.role).toBeNull();
      expect(service.isOnboardingComplete).toBe(false);
    });
  });

  describe('isOnboardingComplete', () => {
    it('should be false when no condominium address or role', () => {
      expect(service.isOnboardingComplete).toBe(false);
    });

    it('should be false when only address is set', () => {
      service.saveLocalCondominiumAddress(mockAddress, 'condo1');
      expect(service.isOnboardingComplete).toBe(false);
    });
  });
});
