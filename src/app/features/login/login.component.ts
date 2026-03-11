import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../components/base.component';
import { OnboardingService } from '../../core/services/onboarding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
  ],
  template: `
    <div class="app-auth-page">
      <div class="app-page-shell app-auth-grid">
        <section class="login-hero d-flex flex-col gap-6">
          <div class="app-badge">{{ 'APP.LOGIN.BADGE' | translate }}</div>

          <div class="d-flex flex-col gap-4">
            <h1 class="login-title m-0">{{ 'APP.LOGIN.TITLE' | translate }}</h1>

            <p class="login-copy m-0">{{ 'APP.LOGIN.SUBTITLE' | translate }}</p>
          </div>

          <div class="d-flex flex-col gap-3">
            <div class="d-flex items-center gap-3">
              <span class="login-dot"></span>
              <span class="text-muted">{{ 'APP.LOGIN.FEATURE_1' | translate }}</span>
            </div>

            <div class="d-flex items-center gap-3">
              <span class="login-dot"></span>
              <span class="text-muted">{{ 'APP.LOGIN.FEATURE_2' | translate }}</span>
            </div>

            <div class="d-flex items-center gap-3">
              <span class="login-dot"></span>
              <span class="text-muted">{{ 'APP.LOGIN.FEATURE_3' | translate }}</span>
            </div>
          </div>

          <mat-card appearance="outlined" class="surface-card p-6">
            <mat-card-content class="p-0">
              <div class="d-flex flex-col gap-2">
                <strong>{{ 'APP.LOGIN.EXAMPLE_TITLE' | translate }}</strong>
                <p class="login-copy m-0">{{ 'APP.LOGIN.EXAMPLE_TEXT' | translate }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <mat-card class="login-panel surface-card--elevated p-4">
          <mat-card-header class="p-0 m-b-4">
            <mat-card-title>{{ 'APP.LOGIN.SIGN_IN_TITLE' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'APP.LOGIN.SIGN_IN_SUBTITLE' | translate }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="p-0 d-flex flex-col gap-5">
            <button
              mat-stroked-button
              type="button"
              class="w-full"
              (click)="onGoogleLogin()"
              [disabled]="loading"
            >
              {{
                (loading ? 'APP.LOGIN.REDIRECTING' : 'APP.LOGIN.CONTINUE_WITH_GOOGLE') | translate
              }}
            </button>

            <div class="d-flex items-center gap-4">
              <mat-divider class="w-full"></mat-divider>
              <span class="text-muted">{{ 'APP.LOGIN.OR' | translate }}</span>
              <mat-divider class="w-full"></mat-divider>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="d-flex flex-col gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'APP.LOGIN.EMAIL_LABEL' | translate }}</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  [placeholder]="'APP.LOGIN.EMAIL_PLACEHOLDER' | translate"
                />
                @if (form.controls.email.touched && form.controls.email.invalid) {
                  <mat-error>{{ 'APP.LOGIN.EMAIL_INVALID' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>{{ 'APP.LOGIN.PASSWORD_LABEL' | translate }}</mat-label>
                <input
                  matInput
                  type="password"
                  formControlName="password"
                  [placeholder]="'APP.LOGIN.PASSWORD_PLACEHOLDER' | translate"
                />
                @if (form.controls.password.touched && form.controls.password.invalid) {
                  <mat-error>{{ 'APP.LOGIN.PASSWORD_REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full"
                [disabled]="form.invalid || loading"
              >
                {{
                  (loading ? 'APP.LOGIN.SIGNING_IN' : 'APP.LOGIN.SIGN_IN_WITH_EMAIL') | translate
                }}
              </button>
            </form>

          </mat-card-content>

          <div class="d-flex justify-content-start gap-4 m-t-4">
            <a class="m-t-10 text-muted" routerLink="/register">
              {{ 'APP.LOGIN.CREATE_ACCOUNT_LINK' | translate }}
            </a>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .login-hero {
        max-width: 640px;
      }

      .login-title {
        font: var(--mat-sys-display-small);
        line-height: 1.02;
        letter-spacing: -0.04em;
        color: var(--mat-sys-on-surface);
      }

      .login-copy {
        color: var(--mat-sys-on-surface-variant);
        font: var(--mat-sys-body-large);
        line-height: 1.7;
      }

      .login-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--mat-sys-primary);
      }

      .login-panel {
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
      }

      @media (max-width: 960px) {
        .login-title {
          font: var(--mat-sys-headline-large);
        }

        .login-panel {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class LoginComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);

  errorMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    super({ loadUnit: false });
  }

  async ngOnInit(): Promise<void> {
    const authenticated = await this.authService.isAuthenticated();
    if (authenticated) {
      await this.redirectAfterLogin();
    }
  }

  async onGoogleLogin(): Promise<void> {
    this.setLoadingState(true);
    await this.authService.loginWithGoogle();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.setLoadingState(true);
    const { email, password } = this.form.getRawValue();
    await this.authService.loginWithEmail(email, password).finally(() => this.setLoadingState(false));
    await this.redirectAfterLogin();
  }

  private async redirectAfterLogin(): Promise<void> {
    // Sincroniza com o backend para garantir o estado correto de onboarding
    try {
      await firstValueFrom(this.onboardingService.syncFromBackend());
    } catch {
      // Usa estado local se o backend estiver indisponível
    }
    if (!this.onboardingService.hasCondominium) {
      await this.navigateTo('/onboarding/condominium');
      return;
    }
    if (!this.onboardingService.hasRole) {
      await this.navigateTo('/onboarding/role');
      return;
    }
    const destination =
      this.onboardingService.role === 'provider' ? '/mural/provider' : '/mural/customer';
    await this.navigateTo(destination);
  }
}
