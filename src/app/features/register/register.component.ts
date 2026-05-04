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

/** Valida força de senha compatível com a política padrão do AWS Cognito */
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

/** Valida que confirmPassword bate com password */
const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value ?? '';
  const confirm = group.get('confirmPassword')?.value ?? '';
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styles: [
    `
      .register-panel {
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
      }
    `,
  ],
})
export class RegisterComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  private readonly snackBar = inject(SnackBarService);

  showPassword = false;
  showConfirmPassword = false;

  registerForm = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  constructor() {
    super();
  }

  get passwordErrors(): Record<string, boolean> | null {
    return this.registerForm.controls.password.errors?.['passwordStrength'] ?? null;
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.setLoadingState(true);

    try {
      const { firstName, lastName, email, password } = this.registerForm.getRawValue();
      await this.authService.registerWithEmail(email, password, firstName, lastName);
      this.snackBar.success(this.translateService.instant('AUTH.REGISTER.ACCOUNT_CREATED'));
      // Redireciona para página dedicada de confirmação de email
      await this.navigateTo(`/confirm-email?email=${encodeURIComponent(email)}`);
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
