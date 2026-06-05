import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserApiService } from '../../../core/services/user-api.service';
import { CondominiumApiService } from '../../../core/services/condominium-api.service';
import { ServiceApiService } from 'src/app/core/services/service-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';

const authServiceMock = {
  forgotPassword: vi.fn().mockResolvedValue({}),
  confirmForgotPassword: vi.fn().mockResolvedValue({}),
  $user: of(null),
  $condominium: of(null),
  $isLogggedIn: of(false),
};

const routerMock = { navigateByUrl: vi.fn().mockResolvedValue(true) };

function setup() {
  vi.clearAllMocks();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ForgotPasswordComponent, ReactiveFormsModule, NoopAnimationsModule, TranslateModule.forRoot()],
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
  const fixture = TestBed.createComponent(ForgotPasswordComponent);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('ForgotPasswordComponent', () => {
  it('deve criar o componente', () => {
    expect(setup()).toBeTruthy();
  });

  it('deve iniciar no passo "email"', () => {
    expect(setup().step).toBe('email');
  });

  it('não deve chamar forgotPassword com email inválido', async () => {
    const comp = setup();
    comp.emailForm.controls.email.setValue('invalido');
    await comp.onRequestCode();
    expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
  });

  it('deve chamar forgotPassword com email válido', async () => {
    const comp = setup();
    comp.emailForm.controls.email.setValue('test@example.com');
    await comp.onRequestCode();
    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('deve avançar para passo "reset" após envio com sucesso', async () => {
    const comp = setup();
    comp.emailForm.controls.email.setValue('test@example.com');
    await comp.onRequestCode();
    expect(comp.step).toBe('reset');
    expect(comp.pendingEmail).toBe('test@example.com');
  });

  it('deve validar força da nova senha', () => {
    const comp = setup();
    comp.resetForm.controls.newPassword.setValue('fraca');
    expect(comp.resetForm.controls.newPassword.invalid).toBe(true);
    expect(comp.newPasswordErrors).toBeTruthy();
  });

  it('deve chamar confirmForgotPassword com dados corretos', async () => {
    const comp = setup();
    comp.pendingEmail = 'test@example.com';
    comp.resetForm.controls.code.setValue('654321');
    comp.resetForm.controls.newPassword.setValue('NewPass1!');
    comp.resetForm.controls.confirmPassword.setValue('NewPass1!');
    await comp.onConfirmReset();
    expect(authServiceMock.confirmForgotPassword).toHaveBeenCalledWith('test@example.com', '654321', 'NewPass1!');
  });

  it('deve avançar para passo "done" após redefinição com sucesso', async () => {
    const comp = setup();
    comp.pendingEmail = 'test@example.com';
    comp.resetForm.controls.code.setValue('654321');
    comp.resetForm.controls.newPassword.setValue('NewPass1!');
    comp.resetForm.controls.confirmPassword.setValue('NewPass1!');
    await comp.onConfirmReset();
    expect(comp.step).toBe('done');
  });

  it('deve alternar showNewPassword', () => {
    const comp = setup();
    expect(comp.showNewPassword).toBe(false);
    comp.toggleNewPasswordVisibility();
    expect(comp.showNewPassword).toBe(true);
  });

  it('deve alternar showConfirmPassword', () => {
    const comp = setup();
    expect(comp.showConfirmPassword).toBe(false);
    comp.toggleConfirmPasswordVisibility();
    expect(comp.showConfirmPassword).toBe(true);
  });
});
