import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';
import { UserApiService } from '../../core/services/user-api.service';
import { CondominiumApiService } from '../../core/services/condominium-api.service';

const authServiceMock = {
  registerWithEmail: jest.fn().mockResolvedValue({}),
  confirmEmailCode: jest.fn().mockResolvedValue({}),
  $user: of(null),
  $condominium: of(null),
  $isLogggedIn: of(false),
};

const routerMock = { navigateByUrl: jest.fn().mockResolvedValue(true) };

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: UserApiService, useValue: {} },
        { provide: CondominiumApiService, useValue: {} },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  // ── Validações do formulário ───────────────────────────────────────────────

  it('deve iniciar com formulário inválido', () => {
    expect(component.registerForm.valid).toBe(false);
  });

  it('deve validar email inválido', () => {
    component.registerForm.controls.email.setValue('invalido');
    expect(component.registerForm.controls.email.hasError('email')).toBe(true);
  });

  it('deve rejeitar senha fraca (menos de 8 chars)', () => {
    component.registerForm.controls.password.setValue('Abc1!');
    expect(component.registerForm.controls.password.invalid).toBe(true);
    expect(component.registerForm.controls.password.errors?.['passwordStrength']).toBeTruthy();
  });

  it('deve rejeitar senha sem maiúscula', () => {
    component.registerForm.controls.password.setValue('abcdef1!');
    expect(component.registerForm.controls.password.errors?.['passwordStrength']?.['uppercase']).toBe(true);
  });

  it('deve rejeitar senha sem número', () => {
    component.registerForm.controls.password.setValue('Abcdefg!');
    expect(component.registerForm.controls.password.errors?.['passwordStrength']?.['number']).toBe(true);
  });

  it('deve rejeitar senha sem caractere especial', () => {
    component.registerForm.controls.password.setValue('Abcdefg1');
    expect(component.registerForm.controls.password.errors?.['passwordStrength']?.['special']).toBe(true);
  });

  it('deve aceitar senha forte', () => {
    component.registerForm.controls.password.setValue('ValidPass1!');
    expect(component.registerForm.controls.password.valid).toBe(true);
  });

  it('deve detectar senhas diferentes (passwordMismatch)', () => {
    component.registerForm.controls.password.setValue('ValidPass1!');
    component.registerForm.controls.confirmPassword.setValue('DifferentPass1!');
    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
  });

  it('não deve ter passwordMismatch quando senhas são iguais', () => {
    component.registerForm.controls.password.setValue('ValidPass1!');
    component.registerForm.controls.confirmPassword.setValue('ValidPass1!');
    expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
  });

  // ── onRegister ────────────────────────────────────────────────────────────

  it('não deve chamar registerWithEmail com formulário inválido', async () => {
    await component.onRegister();
    expect(authServiceMock.registerWithEmail).not.toHaveBeenCalled();
  });

  it('deve chamar registerWithEmail com dados corretos', async () => {
    fillValidRegisterForm(component);
    await component.onRegister();
    expect(authServiceMock.registerWithEmail).toHaveBeenCalledWith(
      'test@example.com', 'ValidPass1!', 'João', 'Silva',
    );
  });

  it('deve transicionar para awaitingConfirmation após registro com sucesso', async () => {
    fillValidRegisterForm(component);
    await component.onRegister();
    expect(component.awaitingConfirmation).toBe(true);
  });

  it('deve exibir errorMessage quando registerWithEmail falha', async () => {
    authServiceMock.registerWithEmail.mockRejectedValueOnce(new Error('Email já existe.'));
    fillValidRegisterForm(component);
    await component.onRegister();
    expect(component.errorMessage).toBe('Email já existe.');
    expect(component.awaitingConfirmation).toBe(false);
  });

  it('deve resetar loading=false após erro em onRegister', async () => {
    authServiceMock.registerWithEmail.mockRejectedValueOnce(new Error('fail'));
    fillValidRegisterForm(component);
    await component.onRegister();
    expect(component.loading).toBe(false);
  });

  // ── onConfirmCode ─────────────────────────────────────────────────────────

  it('não deve chamar confirmEmailCode sem email pendente', async () => {
    component.confirmationForm.controls.code.setValue('123456');
    await component.onConfirmCode();
    expect(authServiceMock.confirmEmailCode).not.toHaveBeenCalled();
  });

  it('deve chamar confirmEmailCode com email e código corretos', async () => {
    component.registeredEmail = 'test@example.com';
    component.confirmationForm.controls.code.setValue('123456');
    await component.onConfirmCode();
    expect(authServiceMock.confirmEmailCode).toHaveBeenCalledWith('test@example.com', '123456');
  });

  it('deve exibir errorMessage quando confirmEmailCode falha', async () => {
    authServiceMock.confirmEmailCode.mockRejectedValueOnce(new Error('Código inválido.'));
    component.registeredEmail = 'test@example.com';
    component.confirmationForm.controls.code.setValue('000000');
    await component.onConfirmCode();
    expect(component.errorMessage).toBe('Código inválido.');
  });

  // ── Toggles de senha ──────────────────────────────────────────────────────

  it('deve alternar showPassword', () => {
    expect(component.showPassword).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
  });

  it('deve alternar showConfirmPassword', () => {
    expect(component.showConfirmPassword).toBe(false);
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBe(true);
  });
});

function fillValidRegisterForm(component: RegisterComponent): void {
  component.registerForm.controls.firstName.setValue('João');
  component.registerForm.controls.lastName.setValue('Silva');
  component.registerForm.controls.email.setValue('test@example.com');
  component.registerForm.controls.password.setValue('ValidPass1!');
  component.registerForm.controls.confirmPassword.setValue('ValidPass1!');
}
