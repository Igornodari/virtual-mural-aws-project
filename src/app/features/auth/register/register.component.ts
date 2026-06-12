import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import BaseComponent from '../../../shared/components/base-component/base.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

/** Valida forca de senha compativel com a politica padrao do AWS Cognito */
const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (!value) return null;
  const errors: Record<string, boolean> = {};
  if (value.length < 8) errors['minLength'] = true;
  if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
  if (!/[a-z]/.test(value)) errors['lowercase'] = true;
  if (!/[0-9]/.test(value)) errors['number'] = true;
  if (!/[^A-Za-z0-9]/.test(value)) errors['special'] = true;
  return Object.keys(errors).length ? { passwordStrength: errors } : null;
};

/** Valida que confirmPassword bate com password */
const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const password = group.get('password')?.value ?? '';
  const confirm = group.get('confirmPassword')?.value ?? '';
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [importBase, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styles: [
    `
      .register-panel {
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
      }
      .terms-checkbox-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--mat-sys-on-surface-variant);
        a {
          color: var(--mat-sys-primary);
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class RegisterComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);

  showPassword = false;
  showConfirmPassword = false;

  readonly termosPath = ROUTE_PATHS.termos;
  readonly privacidadePath = ROUTE_PATHS.privacidade;

  registerForm = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      /** LGPD — consentimento obrigatorio (Art. 7, I da Lei 13.709/2018) */
      termsAccepted: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    super();
  }

  get passwordErrors(): Record<string, boolean> | null {
    return (
      this.registerForm.controls.password.errors?.['passwordStrength'] ?? null
    );
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.setLoadingState(true);

    try {
      const { firstName, lastName, email, password } =
        this.registerForm.getRawValue();
      await this.authService.registerWithEmail(
        email,
        password,
        firstName,
        lastName,
      );
      this.snackBar.success(
        this.translateService.instant('AUTH.REGISTER.ACCOUNT_CREATED'),
      );
      await this.navigateTo(
        `/confirm-email?email=${encodeURIComponent(email)}`,
      );
    } finally {
      this.setLoadingState(false);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
