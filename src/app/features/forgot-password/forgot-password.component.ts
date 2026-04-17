import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import BaseComponent from '../../components/base.component';
import { SnackBarService } from '../../core/services/snack-bar.service';

/** Valida força de senha compatível com AWS Cognito */
const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
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

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('newPassword')?.value ?? '';
  const confirm = group.get('confirmPassword')?.value ?? '';
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

type ForgotStep = 'email' | 'reset' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslateModule,
  ],
  templateUrl: './forgot-password.component.html',
  styles: [
    `
      .forgot-panel {
        width: 100%;
        max-width: 480px;
        margin-inline: auto;
      }
    `,
  ],
})
export class ForgotPasswordComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  private readonly snackBar = inject(SnackBarService);

  step: ForgotStep = 'email';
  pendingEmail = '';
  showNewPassword = false;
  showConfirmPassword = false;

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.fb.nonNullable.group(
    {
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    super();
  }

  get newPasswordErrors(): Record<string, boolean> | null {
    return this.resetForm.controls.newPassword.errors?.['passwordStrength'] ?? null;
  }

  async onRequestCode(): Promise<void> {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.setLoadingState(true);

    try {
      const { email } = this.emailForm.getRawValue();
      await this.authService.forgotPassword(email);
      this.pendingEmail = email;
      this.snackBar.success(this.translateService.instant('APP.FORGOT_PASSWORD.CODE_SENT'));
      this.updateViewState(() => { this.step = 'reset'; });
    } catch (err: unknown) {
      throw err;
    } finally {
      this.setLoadingState(false);
    }
  }

  async onConfirmReset(): Promise<void> {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.setLoadingState(true);

    try {
      const { code, newPassword } = this.resetForm.getRawValue();
      await this.authService.confirmForgotPassword(this.pendingEmail, code, newPassword);
      this.updateViewState(() => { this.step = 'done'; });
    } catch (err: unknown) {
      throw err;
    } finally {
      this.setLoadingState(false);
    }
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
