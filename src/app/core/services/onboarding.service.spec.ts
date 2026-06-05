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
  isProvider: false,
  onboardingCompleted: false,
  addressCompleted: false,
  termsAcceptedAt: null,
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
  let userApiSpy: {
    getMe: ReturnType<typeof vi.fn>;
    updateOnboarding: ReturnType<typeof vi.fn>;
    becomeProvider: ReturnType<typeof vi.fn>;
  };
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
      becomeProvider: vi.fn().mockReturnValue(of({ ...mockProfile, isProvider: true })),
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
      expect(service.isProvider).toBe(false);
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

    it('should return customer dashboard (default) when condominium is set', () => {
      service.saveLocalCondominiumAddress(mockAddress, 'condo1');
      expect(service.resolveNextRoute()).toBe(ROUTE_PATHS.muralCustomer);
    });

    it('should still return customer dashboard even when user is provider (provider is opt-in tab)', () => {
      service['persist']({
        condominiumId: 'condo1',
        condominiumAddress: mockAddress,
        isProvider: true,
        onboardingCompleted: true,
      });
      expect(service.resolveNextRoute()).toBe(ROUTE_PATHS.muralCustomer);
    });
  });

  describe('activateProvider', () => {
    it('should flip isProvider locally and call the API', () => {
      service.activateProvider().subscribe();
      expect(service.isProvider).toBe(true);
      expect(userApiSpy.becomeProvider).toHaveBeenCalledWith(true);
    });

    it('should revert local state on API failure', () => {
      userApiSpy.becomeProvider.mockReturnValue(throwError(() => new Error('Network error')));
      let completed = false;
      service.activateProvider().subscribe({ complete: () => (completed = true) });
      expect(completed).toBe(true);
      expect(service.isProvider).toBe(false);
    });
  });

  describe('deactivateProvider', () => {
    it('should set isProvider to false via the API', () => {
      userApiSpy.becomeProvider.mockReturnValue(of({ ...mockProfile, isProvider: false }));
      service['persist']({
        condominiumId: 'condo1',
        condominiumAddress: mockAddress,
        isProvider: true,
        onboardingCompleted: true,
      });

      service.deactivateProvider().subscribe();
      expect(userApiSpy.becomeProvider).toHaveBeenCalledWith(false);
      expect(service.isProvider).toBe(false);
    });
  });

  describe('syncFromBackend', () => {
    it('should update profile with backend data (no condominium)', () => {
      userApiSpy.getMe.mockReturnValue(
        of({ ...mockProfile, condominiumId: null, isProvider: false }),
      );

      service.syncFromBackend().subscribe();
      expect(service.hasCondominium).toBe(false);
      expect(service.isProvider).toBe(false);
    });

    it('should fetch condominium when user has condominiumId but no local address', () => {
      userApiSpy.getMe.mockReturnValue(
        of({ ...mockProfile, condominiumId: 'condo1', isProvider: true }),
      );

      service.syncFromBackend().subscribe();

      expect(condominiumApiSpy.findOne).toHaveBeenCalledWith('condo1');
      expect(service.hasCondominium).toBe(true);
      expect(service.isProvider).toBe(true);
    });

    it('should not fetch condominium when local address already exists', () => {
      service.saveLocalCondominiumAddress(mockAddress, 'condo1');

      userApiSpy.getMe.mockReturnValue(
        of({ ...mockProfile, condominiumId: 'condo1', isProvider: true }),
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
      service['persist']({
        condominiumId: 'condo1',
        condominiumAddress: mockAddress,
        isProvider: true,
        onboardingCompleted: true,
      });
      expect(service.isProvider).toBe(true);

      service.clear();
      expect(service.isProvider).toBe(false);
      expect(service.isOnboardingComplete).toBe(false);
    });
  });

  describe('isOnboardingComplete', () => {
    it('should be false when no condominium address', () => {
      expect(service.isOnboardingComplete).toBe(false);
    });

    it('should be true when address is set (provider mode is opt-in, not required)', () => {
      service.saveLocalCondominiumAddress(mockAddress, 'condo1');
      expect(service.isOnboardingComplete).toBe(true);
    });
  });

  describe('legacy localStorage migration', () => {
    it('should derive isProvider from legacy role field in localStorage', () => {
      localStorage.setItem(
        'APP_ONBOARDING',
        JSON.stringify({
          condominiumId: 'condo1',
          condominiumAddress: mockAddress,
          role: 'provider',
          onboardingCompleted: true,
        }),
      );

      // Recriar o serviço para forçar leitura do localStorage
      const reloaded = TestBed.inject(OnboardingService);
      const profile = reloaded['loadFromStorage']();
      expect(profile.isProvider).toBe(true);
    });
  });
});
