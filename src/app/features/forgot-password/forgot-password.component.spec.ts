import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../core/services/auth.service';
import { UserApiService } from '../../core/services/user-api.service';
import { CondominiumApiService } from '../../core/services/condominium-api.service';

const authServiceMock = {
  forgotPassword: jest.fn().mockResolvedValue({}),
  confirmForgotPassword: jest.fn().mockResolvedValue({}),
  $user: of(null),
  $condominium: of(null),
  $isLogggedIn: of(false),
};

const routerMock = { navigateByUrl: jest.fn().mockResolvedValue(true) };

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: UserApiService, useValue: {} },
        { provide: CondominiumApiService, useValue: {} },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar no passo "email"', () => {
    expect(component.step).toBe('email');
  });

  // ── Passo 1: email ────────────────────────────────────────────────────────

  it('não deve chamar forgotPassword com email inválido', async () => {
    component.emailForm.controls.email.setValue('invalido');
    await component.onRequestCode();
    expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
  });

  it('não deve chamar forgotPassword com email vazio', async () => {
    await component.onRequestCode();
    expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
  });

  it('deve marcar email como touched ao submeter inválido', async () => {
    await component.onRequestCode();
    expect(component.emailForm.controls.email.touched).toBe(true);
  });

  it('deve chamar forgotPassword com email correto', async () => {
    component.emailForm.controls.email.setValue('test@example.com');
    await component.onRequestCode();
    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('deve avançar para passo "reset" após envio com sucesso', async () => {
    component.emailForm.controls.email.setValue('test@example.com');
    await component.onRequestCode();
    expect(component.step).toBe('reset');
    expect(component.pendingEmail).toBe('test@example.com');
  });

  it('deve exibir errorMessage quando forgotPassword falha', async () => {
    authServiceMock.forgotPassword.mockRejectedValueOnce(new Error('Usuário não encontrado.'));
    component.emailForm.controls.email.setValue('notfound@example.com');
    await component.onRequestCode();
    expect(component.errorMessage).toBe('Usuário não encontrado.');
    expect(component.step).toBe('email');
  });

  it('deve resetar loading=false após erro em onRequestCode', async () => {
    authServiceMock.forgotPassword.mockRejectedValueOnce(new Error('fail'));
    component.emailForm.controls.email.setValue('test@example.com');
    await component.onRequestCode();
    expect(component.loading).toBe(false);
  });

  // ── Passo 2: reset ────────────────────────────────────────────────────────

  it('deve validar força da nova senha', () => {
    component.resetForm.controls.newPassword.setValue('fraca');
    expect(component.resetForm.controls.newPassword.invalid).toBe(true);
    expect(component.newPasswordErrors).toBeTruthy();
  });

  it('deve aceitar nova senha forte', () => {
    component.resetForm.controls.newPassword.setValue('NewPass1!');
    expect(component.resetForm.controls.newPassword.valid).toBe(true);
  });

  it('deve detectar senhas que não conferem', () => {
    component.resetForm.controls.newPassword.setValue('NewPass1!');
    component.resetForm.controls.confirmPassword.setValue('DiffPass1!');
    expect(component.resetForm.hasError('passwordMismatch')).toBe(true);
  });

  it('deve chamar confirmForgotPassword com dados corretos', async () => {
    component.pendingEmail = 'test@example.com';
    component.resetForm.controls.code.setValue('654321');
    component.resetForm.controls.newPassword.setValue('NewPass1!');
    component.resetForm.controls.confirmPassword.setValue('NewPass1!');
    await component.onConfirmReset();
    expect(authServiceMock.confirmForgotPassword).toHaveBeenCalledWith(
      'test@example.com', '654321', 'NewPass1!',
    );
  });

  it('deve avançar para passo "done" após redefinição com sucesso', async () => {
    component.pendingEmail = 'test@example.com';
    component.resetForm.controls.code.setValue('654321');
    component.resetForm.controls.newPassword.setValue('NewPass1!');
    component.resetForm.controls.confirmPassword.setValue('NewPass1!');
    await component.onConfirmReset();
    expect(component.step).toBe('done');
  });

  it('deve exibir errorMessage quando confirmForgotPassword falha', async () => {
    authServiceMock.confirmForgotPassword.mockRejectedValueOnce(new Error('Código expirado.'));
    component.pendingEmail = 'test@example.com';
    component.resetForm.controls.code.setValue('000000');
    component.resetForm.controls.newPassword.setValue('NewPass1!');
    component.resetForm.controls.confirmPassword.setValue('NewPass1!');
    await component.onConfirmReset();
    expect(component.errorMessage).toBe('Código expirado.');
    expect(component.step).toBe('reset');
  });

  // ── Toggles de senha ──────────────────────────────────────────────────────

  it('deve alternar showNewPassword', () => {
    expect(component.showNewPassword).toBe(false);
    component.toggleNewPasswordVisibility();
    expect(component.showNewPassword).toBe(true);
  });

  it('deve alternar showConfirmPassword', () => {
    expect(component.showConfirmPassword).toBe(false);
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBe(true);
  });
});
