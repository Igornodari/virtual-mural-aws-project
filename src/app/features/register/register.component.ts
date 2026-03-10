import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';

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
    MatInputModule,
  ],
  template: `
    <div class="app-auth-page">
      <div class="app-page-shell">
        <mat-card class="register-panel surface-card--elevated p-4">
          <mat-card-header class="p-0 m-b-4">
            <mat-card-title>Create account</mat-card-title>
            <mat-card-subtitle>
              @if (!awaitingConfirmation) {
                Register your account to access your condominium board.
              } @else {
                Enter the code sent to your email.
              }
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="p-0 d-flex flex-col gap-4">
            @if (!awaitingConfirmation) {
              <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="d-flex flex-col gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>First name</mat-label>
                  <input matInput formControlName="firstName" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Last name</mat-label>
                  <input matInput formControlName="lastName" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Confirm password</mat-label>
                  <input matInput type="password" formControlName="confirmPassword" />
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="registerForm.invalid || loading"
                >
                  {{ loading ? 'Creating...' : 'Create account' }}
                </button>
              </form>
            } @else {
              <form [formGroup]="confirmationForm" (ngSubmit)="onConfirmCode()" class="d-flex flex-col gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Confirmation code</mat-label>
                  <input matInput formControlName="code" />
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="confirmationForm.invalid || loading"
                >
                  {{ loading ? 'Confirming...' : 'Confirm email' }}
                </button>
              </form>
            }

            @if (successMessage) {
              <div class="app-success-box">{{ successMessage }}</div>
            }

            @if (errorMessage) {
              <div class="app-error-box">{{ errorMessage }}</div>
            }

            <a routerLink="/login">Back to login</a>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
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
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  awaitingConfirmation = false;
  registeredEmail = '';
  errorMessage = '';
  successMessage = '';

  registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  confirmationForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
  });

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) return;

    const { firstName, lastName, email, password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.registerWithEmail(email, password, firstName, lastName);
      this.registeredEmail = email;
      this.awaitingConfirmation = true;
      this.successMessage = 'Account created. Check your email for the confirmation code.';
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'Unable to create account.';
    } finally {
      this.loading = false;
    }
  }

  async onConfirmCode(): Promise<void> {
    if (this.confirmationForm.invalid || !this.registeredEmail) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.confirmEmailCode(this.registeredEmail, this.confirmationForm.getRawValue().code);
      this.successMessage = 'Email confirmed. You can now log in.';
      await this.router.navigateByUrl('/login');
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'Unable to confirm code.';
    } finally {
      this.loading = false;
    }
  }
}
