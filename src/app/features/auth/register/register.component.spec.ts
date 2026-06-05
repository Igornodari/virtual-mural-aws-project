import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserApiService } from '../../../core/services/user-api.service';
import { CondominiumApiService } from '../../../core/services/condominium-api.service';
import { ServiceApiService } from 'src/app/core/services/service-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';

const authServiceMock = {
  registerWithEmail: vi.fn().mockResolvedValue({}),
  $user: of(null),
  $condominium: of(null),
  $isLogggedIn: of(false),
};

const routerMock = { navigateByUrl: vi.fn().mockResolvedValue(true) };

function setup() {
  vi.clearAllMocks();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [RegisterComponent, ReactiveFormsModule, NoopAnimationsModule, TranslateModule.forRoot()],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: UserApiService, useValue: {} },
      { provide: CondominiumApiService, useValue: {} },
      { provide: ServiceApiService, useValue: {} },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      { provide: SnackBarService, useValue: { success: vi.fn(), error: vi.fn() } },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      TranslateService,
    ],
  });
  const fixture = TestBed.createComponent(RegisterComponent);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('RegisterComponent', () => {
  it('deve criar o componente', () => {
    expect(setup()).toBeTruthy();
  });

  it('deve iniciar com formulário inválido', () => {
    expect(setup().registerForm.valid).toBe(false);
  });

  it('deve validar email inválido', () => {
    const comp = setup();
    comp.registerForm.controls.email.setValue('invalido');
    expect(comp.registerForm.controls.email.hasError('email')).toBe(true);
  });

  it('deve rejeitar senha fraca (menos de 8 chars)', () => {
    const comp = setup();
    comp.registerForm.controls.password.setValue('Abc1!');
    expect(comp.registerForm.controls.password.invalid).toBe(true);
    expect(comp.registerForm.controls.password.errors?.['passwordStrength']).toBeTruthy();
  });

  it('deve aceitar senha forte', () => {
    const comp = setup();
    comp.registerForm.controls.password.setValue('ValidPass1!');
    expect(comp.registerForm.controls.password.valid).toBe(true);
  });

  it('deve detectar senhas diferentes (passwordMismatch)', () => {
    const comp = setup();
    comp.registerForm.controls.password.setValue('ValidPass1!');
    comp.registerForm.controls.confirmPassword.setValue('DifferentPass1!');
    expect(comp.registerForm.hasError('passwordMismatch')).toBe(true);
  });

  it('não deve chamar registerWithEmail com formulário inválido', async () => {
    await setup().onRegister();
    expect(authServiceMock.registerWithEmail).not.toHaveBeenCalled();
  });

  it('deve alternar showPassword', () => {
    const comp = setup();
    expect(comp.showPassword).toBe(false);
    comp.togglePasswordVisibility();
    expect(comp.showPassword).toBe(true);
  });

  it('deve alternar showConfirmPassword', () => {
    const comp = setup();
    expect(comp.showConfirmPassword).toBe(false);
    comp.toggleConfirmPasswordVisibility();
    expect(comp.showConfirmPassword).toBe(true);
  });
});
