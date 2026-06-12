import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { UserApiService } from '../../../core/services/user-api.service';
import { CondominiumApiService } from '../../../core/services/condominium-api.service';
import { ServiceApiService } from 'src/app/core/services/service-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';

const authServiceMock = {
  isAuthenticated: vi.fn().mockResolvedValue(false),
  loginWithEmail: vi.fn().mockResolvedValue({}),
  loginWithGoogle: vi.fn().mockResolvedValue(undefined),
  $user: of(null),
  $condominium: of(null),
  $isLogggedIn: of(false),
};

const routerMock = { navigateByUrl: vi.fn().mockResolvedValue(true) };
const onboardingMock = { isOnboardingComplete: vi.fn().mockReturnValue(true), profile$: of({ isProvider: false }) };

function setup() {
  vi.clearAllMocks();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule, TranslateModule.forRoot()],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: OnboardingService, useValue: onboardingMock },
      { provide: UserApiService, useValue: {} },
      { provide: CondominiumApiService, useValue: {} },
      { provide: ServiceApiService, useValue: {} },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      { provide: SnackBarService, useValue: { success: vi.fn(), error: vi.fn() } },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
    ],
  });
  const fixture = TestBed.createComponent(LoginComponent);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('LoginComponent', () => {
  it('deve criar o componente', () => {
    expect(setup()).toBeTruthy();
  });

  it('deve iniciar com formulário inválido', () => {
    expect(setup().form.valid).toBe(false);
  });

  it('deve validar campo email obrigatório', () => {
    const comp = setup();
    comp.form.controls.email.setValue('');
    expect(comp.form.controls.email.invalid).toBe(true);
  });

  it('deve validar formato de email', () => {
    const comp = setup();
    comp.form.controls.email.setValue('nao-e-email');
    expect(comp.form.controls.email.hasError('email')).toBe(true);
  });

  it('não deve chamar loginWithEmail com formulário inválido', async () => {
    await setup().onSubmit();
    expect(authServiceMock.loginWithEmail).not.toHaveBeenCalled();
  });

  it('deve alternar showPassword', () => {
    const comp = setup();
    expect(comp.showPassword).toBe(false);
    comp.togglePasswordVisibility();
    expect(comp.showPassword).toBe(true);
  });
});
