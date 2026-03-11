import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../../core/services/snack-bar.service';
import BaseComponent from '../../components/base.component';

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
    TranslateModule,
  ],
  template: `
    <div class="app-auth-page">
      <div class="app-page-shell">
        <mat-card class="register-panel surface-card--elevated p-4">
          <mat-card-header class="p-0 m-b-4">
            <mat-card-title>{{ 'APP.REGISTER.TITLE' | translate }}</mat-card-title>
            <mat-card-subtitle>
              @if (!awaitingConfirmation) {
                {{ 'APP.REGISTER.SUBTITLE_CREATE' | translate }}
              } @else {
                {{ 'APP.REGISTER.SUBTITLE_CONFIRM' | translate }}
              }
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="p-0 d-flex flex-col gap-4">
            @if (!awaitingConfirmation) {
              <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="d-flex flex-col gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.REGISTER.FIRST_NAME' | translate }}</mat-label>
                  <input matInput formControlName="firstName" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.REGISTER.LAST_NAME' | translate }}</mat-label>
                  <input matInput formControlName="lastName" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.REGISTER.EMAIL' | translate }}</mat-label>
                  <input matInput type="email" formControlName="email" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.REGISTER.PASSWORD' | translate }}</mat-label>
                  <input matInput type="password" formControlName="password" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.REGISTER.CONFIRM_PASSWORD' | translate }}</mat-label>
                  <input matInput type="password" formControlName="confirmPassword" />
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="registerForm.invalid || loading"
                >
                  {{
                    (loading ? 'APP.REGISTER.CREATING' : 'APP.REGISTER.CREATE_ACCOUNT') | translate
                  }}
                </button>
              </form>
            } @else {
              <form [formGroup]="confirmationForm" (ngSubmit)="onConfirmCode()" class="d-flex flex-col gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'APP.REGISTER.CODE' | translate }}</mat-label>
                  <input matInput formControlName="code" />
                </mat-form-field>

                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="confirmationForm.invalid || loading"
                >
                  {{
                    (loading ? 'APP.REGISTER.CONFIRMING' : 'APP.REGISTER.CONFIRM_EMAIL') | translate
                  }}
                </button>
              </form>
            }

            <a routerLink="/login">{{ 'APP.REGISTER.BACK_TO_LOGIN' | translate }}</a>
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
export class RegisterComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snackBarService = inject(SnackBarService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

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

  constructor() {
    super({ loadUnit: false });
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) return;

    const { firstName, lastName, email, password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.presentError(this.translateService.instant('APP.REGISTER.PASSWORDS_DO_NOT_MATCH'));
      return;
    }

    this.setLoading(true);

    try {
      await this.authService.registerWithEmail(email, password, firstName, lastName);
      this.registeredEmail = email;
      this.awaitingConfirmation = true;
      this.presentSuccess(this.translateService.instant('APP.REGISTER.ACCOUNT_CREATED'));
    } catch (error: any) {
      this.presentError(this.resolveErrorMessage(error));
    } finally {
      this.setLoading(false);
    }
  }

  async onConfirmCode(): Promise<void> {
    if (this.confirmationForm.invalid || !this.registeredEmail) return;

    this.setLoading(true);

    try {
      await this.authService.confirmEmailCode(this.registeredEmail, this.confirmationForm.getRawValue().code);
      this.presentSuccess(this.translateService.instant('APP.REGISTER.EMAIL_CONFIRMED'));
      await this.router.navigateByUrl('/login');
    } catch (error: any) {
      this.presentError(this.resolveErrorMessage(error));
    } finally {
      this.setLoading(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    const e = error as { message?: string; __type?: string; errors?: Array<{ message?: string }> };
    return (
      e?.message?.trim() ||
      e?.errors?.[0]?.message?.trim() ||
      (e?.__type ? `${e.__type}` : '') ||
      this.translateService.instant('APP.REGISTER.UNKNOWN_ERROR')
    );
  }

  private presentError(message: string): void {
    setTimeout(() => this.snackBarService.error(message));
  }

  private presentSuccess(message: string): void {
    setTimeout(() => this.snackBarService.success(message));
  }

  private setLoading(value: boolean): void {
    setTimeout(() => {
      this.loading = value;
    });
  }
}
