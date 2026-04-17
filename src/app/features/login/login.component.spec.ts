import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { UserApiService } from '../../core/services/user-api.service';
import { CondominiumApiService } from '../../core/services/condominium-api.service';

const authServiceMock = {
  isAuthenticated: jest.fn().mockResolvedValue(false),
  loginWithEmail: jest.fn().mockResolvedValue({}),
  loginWithGoogle: jest.fn().mockResolvedValue(undefined),
  $user: of(null),
  $condominium: of(null),
  $isLogggedIn: of(false),
};

const onboardingServiceMock = {
  syncAndResolveNextRoute: jest.fn().mockReturnValue(of('/mural/customer')),
};

const routerMock = {
  navigateByUrl: jest.fn().mockResolvedValue(true),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: OnboardingService, useValue: onboardingServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: UserApiService, useValue: {} },
        { provide: CondominiumApiService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Renderização ──────────────────────────────────────────────────────────

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o formulário com campos vazios e inválido', () => {
    expect(component.form.valid).toBe(false);
    expect(component.form.controls.email.value).toBe('');
    expect(component.form.controls.password.value).toBe('');
  });

  it('deve exibir erro de email inválido quando campo touched', () => {
    component.form.controls.email.setValue('not-an-email');
    component.form.controls.email.markAsTouched();
    fixture.detectChanges();
    expect(component.form.controls.email.invalid).toBe(true);
    expect(component.form.controls.email.hasError('email')).toBe(true);
  });

  it('deve exibir erro quando email está vazio e touched', () => {
    component.form.controls.email.setValue('');
    component.form.controls.email.markAsTouched();
    expect(component.form.controls.email.hasError('required')).toBe(true);
  });

  // ── Submit ────────────────────────────────────────────────────────────────

  it('não deve submeter com formulário inválido', async () => {
    component.form.controls.email.setValue('');
    component.form.controls.password.setValue('');
    await component.onSubmit();
    expect(authServiceMock.loginWithEmail).not.toHaveBeenCalled();
  });

  it('deve marcar todos os campos como touched ao submeter inválido', async () => {
    await component.onSubmit();
    expect(component.form.controls.email.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);
  });

  it('deve chamar loginWithEmail com email e senha corretos', fakeAsync(async () => {
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');

    await component.onSubmit();
    tick();

    expect(authServiceMock.loginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
  }));

  it('deve exibir mensagem de erro quando login falha', async () => {
    authServiceMock.loginWithEmail.mockRejectedValueOnce(new Error('Invalid email or password.'));
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('wrongpass');

    await component.onSubmit();

    expect(component.errorMessage).toBe('Invalid email or password.');
  });

  it('deve limpar errorMessage antes de novo submit', async () => {
    component.errorMessage = 'erro anterior';
    authServiceMock.loginWithEmail.mockResolvedValueOnce({});
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('password123');

    await component.onSubmit();

    expect(component.errorMessage).toBe('');
  });

  it('deve resetar loading=false mesmo quando login falha', async () => {
    authServiceMock.loginWithEmail.mockRejectedValueOnce(new Error('fail'));
    component.form.controls.email.setValue('test@example.com');
    component.form.controls.password.setValue('pass');

    await component.onSubmit();

    expect(component.loading).toBe(false);
  });

  // ── Toggle de senha ───────────────────────────────────────────────────────

  it('deve alternar showPassword ao chamar togglePasswordVisibility', () => {
    expect(component.showPassword).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  // ── Google login ──────────────────────────────────────────────────────────

  it('deve chamar loginWithGoogle ao clicar no botão Google', async () => {
    await component.onGoogleLogin();
    expect(authServiceMock.loginWithGoogle).toHaveBeenCalled();
  });

  it('deve resetar loading quando loginWithGoogle lança erro', async () => {
    authServiceMock.loginWithGoogle.mockRejectedValueOnce(new Error('Google error'));
    await component.onGoogleLogin();
    expect(component.loading).toBe(false);
  });

  // ── Redirecionamento ──────────────────────────────────────────────────────

  it('deve redirecionar para /login se já autenticado no ngOnInit', async () => {
    authServiceMock.isAuthenticated.mockResolvedValueOnce(true);
    await component.ngOnInit();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/mural/customer');
  });
});
