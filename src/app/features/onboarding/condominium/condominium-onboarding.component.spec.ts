/**
 * Testes do CondominiumOnboardingComponent.
 *
 * Foco:
 *  - Validação do formulário (CEP, campos obrigatórios)
 *  - onCepInput: formatação do CEP (XXXXX-XXX)
 *  - fetchAddress: chama lookupCep e faz patch no form
 *  - fetchAddress: exibe cepError quando ViaCep retorna erro
 *  - onSubmit: no-op quando form inválido
 *  - onSubmit: chama ensureCondominiumRegistration com endereço correto
 *  - onSubmit: navega para /mural/customer em caso de sucesso ou erro
 */
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { CondominiumOnboardingComponent } from './condominium-onboarding.component';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { CondominiumApiService, ViaCepResponse } from 'src/app/core/services/condominium-api.service';
import { UserApiService } from 'src/app/core/services/user-api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ServiceApiService } from 'src/app/core/services/service-api.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeViaCepResponse(overrides: Partial<ViaCepResponse> = {}): ViaCepResponse {
  return {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    complemento: '',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP',
    ...overrides,
  };
}

// ── Fábrica de TestBed ────────────────────────────────────────────────────────

function setup(options: {
  cepResponse?: ViaCepResponse | null;
  cepError?: boolean;
  submitError?: boolean;
} = {}) {
  const { cepResponse = makeViaCepResponse(), cepError = false, submitError = false } = options;

  const navigateByUrlSpy = vi.fn().mockResolvedValue(true);
  const ensureSpy = vi.fn().mockReturnValue(
    submitError ? throwError(() => new Error('Server error')) : of({ id: 'condo-1' }),
  );

  const condominiumApiSpy = {
    lookupCep: vi.fn().mockReturnValue(
      cepError ? throwError(() => new Error('Timeout')) : of(cepResponse),
    ),
  };

  const onboardingServiceSpy = {
    ensureCondominiumRegistration: ensureSpy,
  };

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ReactiveFormsModule],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideAnimationsAsync(),
      { provide: OnboardingService, useValue: onboardingServiceSpy },
      { provide: CondominiumApiService, useValue: condominiumApiSpy },
      {
        provide: UserApiService,
        useValue: { getMe: vi.fn().mockReturnValue(of(null)) },
      },
      {
        provide: AuthService,
        useValue: { $user: of(null), $condominium: of(null) },
      },
      { provide: ServiceApiService, useValue: {} },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      { provide: SnackBarService, useValue: { success: vi.fn(), error: vi.fn() } },
      {
        provide: TranslateService,
        useValue: { instant: vi.fn((k: string) => k), get: vi.fn(() => of('')) },
      },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: { get: () => null } } },
      },
      { provide: Router, useValue: { navigateByUrl: navigateByUrlSpy, url: '/' } },
    ],
  });

  const fixture = TestBed.createComponent(CondominiumOnboardingComponent);
  const comp = fixture.componentInstance;

  return { comp, fixture, condominiumApiSpy, onboardingServiceSpy, ensureSpy, navigateByUrlSpy };
}

// ── Utilitário: simula evento de input ────────────────────────────────────────

function makeInputEvent(value: string): Event {
  const input = document.createElement('input');
  input.value = value;
  return { target: input } as unknown as Event;
}

// ── Suíte ─────────────────────────────────────────────────────────────────────

describe('CondominiumOnboardingComponent', () => {
  it('deve estar definido', () => {
    const { comp } = setup();
    expect(comp).toBeTruthy();
  });

  // ── Validação do formulário ───────────────────────────────────────────────

  describe('validação do formulário', () => {
    it('deve ser inválido quando vazio', () => {
      const { comp } = setup();
      expect(comp.form.invalid).toBe(true);
    });

    it('deve ser inválido quando CEP tem menos de 8 dígitos', () => {
      const { comp } = setup();
      comp.form.controls.zipCode.setValue('01310');
      expect(comp.form.controls.zipCode.invalid).toBe(true);
    });

    it('deve ser válido quando todos os campos obrigatórios estão preenchidos', () => {
      const { comp } = setup();
      comp.form.setValue({
        zipCode: '01310-100',
        street: 'Av. Paulista',
        number: '1000',
        complement: '',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      });
      expect(comp.form.valid).toBe(true);
    });

    it('deve aceitar CEP no formato XXXXX-XXX', () => {
      const { comp } = setup();
      comp.form.controls.zipCode.setValue('01310-100');
      expect(comp.form.controls.zipCode.errors).toBeNull();
    });

    it('deve listar todos os 27 estados brasileiros', () => {
      const { comp } = setup();
      expect(comp.states).toHaveLength(27);
      expect(comp.states).toContain('SP');
      expect(comp.states).toContain('RJ');
    });
  });

  // ── onCepInput ────────────────────────────────────────────────────────────

  describe('onCepInput()', () => {
    it('deve formatar CEP com traço após 5 dígitos', () => {
      const { comp } = setup();
      comp.onCepInput(makeInputEvent('01310100'));
      expect(comp.form.controls.zipCode.value).toBe('01310-100');
    });

    it('deve manter CEP sem traço quando tem 5 dígitos ou menos', () => {
      const { comp } = setup();
      comp.onCepInput(makeInputEvent('01310'));
      expect(comp.form.controls.zipCode.value).toBe('01310');
    });

    it('deve limpar cepError ao digitar', () => {
      const { comp } = setup();
      comp.cepError = 'Erro anterior';
      comp.onCepInput(makeInputEvent('01310'));
      expect(comp.cepError).toBe('');
    });

    it('deve remover caracteres não numéricos antes de formatar', () => {
      const { comp } = setup();
      comp.onCepInput(makeInputEvent('01.310-100'));
      expect(comp.form.controls.zipCode.value).toBe('01310-100');
    });
  });

  // ── fetchAddress ──────────────────────────────────────────────────────────

  describe('fetchAddress()', () => {
    it('deve chamar lookupCep com os 8 dígitos do CEP', () => {
      const { comp, condominiumApiSpy } = setup();
      comp.form.controls.zipCode.setValue('01310-100');
      comp.fetchAddress();
      expect(condominiumApiSpy.lookupCep).toHaveBeenCalledWith('01310100');
    });

    it('NÃO deve chamar lookupCep quando CEP tem menos de 8 dígitos', () => {
      const { comp, condominiumApiSpy } = setup();
      comp.form.controls.zipCode.setValue('01310');
      comp.fetchAddress();
      expect(condominiumApiSpy.lookupCep).not.toHaveBeenCalled();
    });

    it('deve preencher os campos do formulário com a resposta do ViaCep', () => {
      const { comp } = setup({
        cepResponse: makeViaCepResponse({
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      });

      comp.form.controls.zipCode.setValue('01310-100');
      comp.fetchAddress();

      expect(comp.form.controls.street.value).toBe('Avenida Paulista');
      expect(comp.form.controls.neighborhood.value).toBe('Bela Vista');
      expect(comp.form.controls.city.value).toBe('São Paulo');
      expect(comp.form.controls.state.value).toBe('SP');
    });

    it('deve definir cepError quando ViaCep retorna erro no payload', () => {
      const { comp } = setup({
        cepResponse: makeViaCepResponse({ erro: true }),
      });
      comp.form.controls.zipCode.setValue('99999-999');
      comp.fetchAddress();
      expect(comp.cepError).toContain('CEP nao encontrado');
    });

    it('deve definir loadingCep=false após a busca concluir', () => {
      const { comp } = setup();
      comp.form.controls.zipCode.setValue('01310-100');
      comp.fetchAddress();
      expect(comp.loadingCep).toBe(false);
    });
  });

  // ── onSubmit ──────────────────────────────────────────────────────────────

  describe('onSubmit()', () => {
    it('NÃO deve chamar ensureCondominiumRegistration quando form é inválido', async () => {
      const { comp, ensureSpy } = setup();
      await comp.onSubmit();
      expect(ensureSpy).not.toHaveBeenCalled();
    });

    it('deve chamar ensureCondominiumRegistration com endereço correto', async () => {
      const { comp, ensureSpy } = setup();
      comp.form.setValue({
        zipCode: '01310-100',
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Apto 1',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      });

      await comp.onSubmit();

      expect(ensureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          zipCode: '01310100', // sem traço
          street: 'Av. Paulista',
          number: '1000',
          complement: 'Apto 1',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
        }),
      );
    });

    it('deve remover o traço do CEP ao submeter', async () => {
      const { comp, ensureSpy } = setup();
      comp.form.setValue({
        zipCode: '01310-100',
        street: 'Rua X',
        number: '10',
        complement: '',
        neighborhood: 'Centro',
        city: 'SP',
        state: 'SP',
      });

      await comp.onSubmit();

      const [address] = ensureSpy.mock.calls[0] as [{ zipCode: string }];
      expect(address.zipCode).toBe('01310100');
    });

    it('deve omitir complement do endereço quando está vazio', async () => {
      const { comp, ensureSpy } = setup();
      comp.form.setValue({
        zipCode: '01310-100',
        street: 'Rua X',
        number: '10',
        complement: '',
        neighborhood: 'Centro',
        city: 'SP',
        state: 'SP',
      });

      await comp.onSubmit();

      const [address] = ensureSpy.mock.calls[0] as [{ complement?: string }];
      expect(address.complement).toBeUndefined();
    });

    it('deve navegar para /mural/customer após cadastro bem-sucedido', async () => {
      const { comp, navigateByUrlSpy } = setup();
      comp.form.setValue({
        zipCode: '01310-100',
        street: 'Av. Paulista',
        number: '1000',
        complement: '',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      });

      await comp.onSubmit();

      expect(navigateByUrlSpy).toHaveBeenCalledWith(ROUTE_PATHS.muralCustomer);
    });

    it('deve navegar para /mural/customer mesmo quando a API retorna erro', async () => {
      const { comp, navigateByUrlSpy } = setup({ submitError: true });
      comp.form.setValue({
        zipCode: '01310-100',
        street: 'Av. Paulista',
        number: '1000',
        complement: '',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      });

      await comp.onSubmit();

      expect(navigateByUrlSpy).toHaveBeenCalledWith(ROUTE_PATHS.muralCustomer);
    });
  });
});
