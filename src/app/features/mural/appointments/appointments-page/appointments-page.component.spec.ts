/**
 * Testes do MuralAppointmentsPageComponent.
 * Foco na lógica de classificação (customer/provider) — esse é o bug
 * que motivou a reescrita: agendamentos caindo na aba errada.
 *
 * Testamos via os computed signals em vez de chamar o método privado
 * diretamente — cobre o comportamento observável pela UI.
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { MuralAppointmentsPageComponent } from './appointments-page.component';
import {
  AppointmentApiService,
  AppointmentDto,
} from 'src/app/core/services/appointment-api.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import {
  UserApiService,
  AppUserProfileDto,
} from 'src/app/core/services/user-api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CondominiumApiService } from 'src/app/core/services/condominium-api.service';
import { ServiceApiService } from 'src/app/core/services/service-api.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';

function makeAppointment(
  overrides: Partial<AppointmentDto> = {},
): AppointmentDto {
  return {
    id: 'a1',
    serviceId: 'svc-1',
    customerId: 'user-default',
    scheduledDate: '2026-06-01',
    scheduledDay: 'monday',
    scheduledTime: '10:00',
    status: 'pending',
    service: {
      id: 'svc-1',
      name: 'Test',
      price: '50',
      contact: '99',
      providerId: 'provider-default',
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeProfile(
  overrides: Partial<AppUserProfileDto> = {},
): AppUserProfileDto {
  return {
    id: 'me-db-id',
    cognitoSub: 'cognito-sub-distinct',
    email: 'me@example.com',
    givenName: '',
    familyName: '',
    displayName: '',
    condominiumId: 'condo-1',
    isProvider: false,
    onboardingCompleted: true,
    addressCompleted: true,
    termsAcceptedAt: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function configureTestBed(
  appointments: AppointmentDto[],
  profile: AppUserProfileDto = makeProfile(),
  isProvider = false,
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideAnimationsAsync(),
      {
        provide: AppointmentApiService,
        useValue: { findMine: vi.fn().mockReturnValue(of(appointments)) },
      },
      { provide: OnboardingService, useValue: { isProvider, getProfile: vi.fn().mockReturnValue(of(profile)) } },
      {
        provide: UserApiService,
        useValue: { getMe: vi.fn().mockReturnValue(of(profile)) },
      },
      {
        provide: AuthService,
        useValue: {
          $user: of({ id: 'cognito-sub-distinct' }),
          $condominium: of(null),
        },
      },
      { provide: CondominiumApiService, useValue: {} },
      { provide: ServiceApiService, useValue: {} },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      {
        provide: SnackBarService,
        useValue: { success: vi.fn(), error: vi.fn() },
      },
      {
        provide: TranslateService,
        useValue: {
          instant: vi.fn((k: string) => k),
          get: vi.fn(() => of('')),
        },
      },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: { get: () => null } } },
      },
      { provide: Router, useValue: { navigateByUrl: vi.fn() } },
    ],
  });
}

function mount() {
  const fixture = TestBed.createComponent(MuralAppointmentsPageComponent);
  fixture.componentInstance.ngOnInit();
  return fixture.componentInstance;
}

describe('MuralAppointmentsPageComponent — classificação', () => {
  it('classifica via viewerRole quando o backend manda esse campo', () => {
    const cust = makeAppointment({ id: 'c1', viewerRole: 'customer' });
    const prov = makeAppointment({ id: 'p1', viewerRole: 'provider' });
    configureTestBed([cust, prov], makeProfile(), true);
    const comp = mount();

    expect(comp.customerAppointments().map((a) => a.id)).toEqual(['c1']);
    expect(comp.providerAppointments().map((a) => a.id)).toEqual(['p1']);
  });

  it('fallback: classifica pelo customerId quando viewerRole ausente', () => {
    const meBooked = makeAppointment({ id: 'mine', customerId: 'me-db-id' });
    const otherBooked = makeAppointment({
      id: 'other',
      customerId: 'someone-else',
      service: {
        id: 'svc-1',
        name: 'S',
        price: '50',
        contact: '',
        providerId: 'me-db-id',
      },
    });

    configureTestBed([meBooked, otherBooked], makeProfile(), true);
    const comp = mount();

    expect(comp.customerAppointments().map((a) => a.id)).toEqual(['mine']);
    expect(comp.providerAppointments().map((a) => a.id)).toEqual(['other']);
  });

  it('regressão direta do bug original: agendamento do morador NÃO vai pra aba prestador', () => {
    const meBooked = makeAppointment({
      id: 'b',
      customerId: 'me-db-id',
      viewerRole: 'customer',
      service: {
        id: 'svc',
        name: 'S',
        price: '50',
        contact: '',
        providerId: 'other-provider',
      },
    });
    configureTestBed([meBooked], makeProfile(), true);
    const comp = mount();

    expect(comp.providerAppointments()).toHaveLength(0);
    expect(comp.customerAppointments()).toHaveLength(1);
  });

  it('retorna unknown quando dbUserId ainda não foi carregado e viewerRole ausente', () => {
    // userApi.getMe retorna null → dbUserId fica null.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        {
          provide: AppointmentApiService,
          useValue: { findMine: vi.fn().mockReturnValue(of([])) },
        },
        { provide: OnboardingService, useValue: { isProvider: true, getProfile: vi.fn().mockReturnValue(of(null as unknown as AppUserProfileDto)) } },
        {
          provide: UserApiService,
          useValue: { getMe: vi.fn().mockReturnValue(of(null as any)) },
        },
        {
          provide: AuthService,
          useValue: {
            $user: of({ id: 'cognito' }),
            $condominium: of(null),
          },
        },
        { provide: CondominiumApiService, useValue: {} },
        { provide: ServiceApiService, useValue: {} },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: SnackBarService,
          useValue: { success: vi.fn(), error: vi.fn() },
        },
        {
          provide: TranslateService,
          useValue: { instant: vi.fn(), get: vi.fn(() => of('')) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(MuralAppointmentsPageComponent);
    const comp = fixture.componentInstance;
    const noTagAppt = makeAppointment({ id: 'x' });
    delete (noTagAppt as { viewerRole?: 'customer' | 'provider' }).viewerRole;
    comp.allAppointments.set([noTagAppt]);
    (comp as unknown as { dbUserId: { set: (v: string | null) => void } }).dbUserId.set(null);

    // 'unknown': não entra em nenhuma das duas listas
    expect(comp.customerAppointments()).toHaveLength(0);
    expect(comp.providerAppointments()).toHaveLength(0);
  });

  it('considera service.provider.id como fallback quando service.providerId ausente', () => {
    const appt = makeAppointment({
      id: 'p',
      customerId: 'other',
      service: {
        id: 'svc',
        name: 'X',
        price: '0',
        contact: '',
        provider: { id: 'me-db-id', displayName: 'Me' },
      } as { id: string; name: string; price: string; contact: string; provider?: { id?: string; displayName: string } },
    });
    configureTestBed([appt], makeProfile(), true);
    const comp = mount();
    expect(comp.providerAppointments()).toHaveLength(1);
  });

  it('alternar abas atualiza a lista atual', () => {
    const cust = makeAppointment({ id: 'c', viewerRole: 'customer' });
    const prov = makeAppointment({ id: 'p', viewerRole: 'provider' });
    configureTestBed([cust, prov], makeProfile(), true);
    const comp = mount();

    expect(comp.currentAppointments().map((a) => a.id)).toEqual(['c']);
    comp.setActiveTab('asProvider');
    expect(comp.currentAppointments().map((a) => a.id)).toEqual(['p']);
  });

  it('quando isProvider=false, isProvider() do componente fica false', () => {
    const prov = makeAppointment({ id: 'p', viewerRole: 'provider' });
    configureTestBed([prov], makeProfile(), false);
    const comp = mount();
    expect(comp.isProvider()).toBe(false);
  });
});
