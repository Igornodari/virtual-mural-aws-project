import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../core/services/snack-bar.service';
import BaseComponent from '../../components/base.component';

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
  ],
  template: `
    <div class="app-auth-page">
      <div class="app-page-shell app-auth-grid">
        <section class="login-hero d-flex flex-col gap-6">
          <div class="app-badge">Condo marketplace</div>

          <div class="d-flex flex-col gap-4">
            <h1 class="login-title m-0">The virtual board that connects residents and services</h1>

            <p class="login-copy m-0">
              Discover products and local services available inside your condominium.
              A simple way to connect who offers with who needs.
            </p>
          </div>

          <div class="d-flex flex-col gap-3">
            <div class="d-flex items-center gap-3">
              <span class="login-dot"></span>
              <span class="text-muted">Haircuts, sweets, maintenance, pets and more</span>
            </div>

            <div class="d-flex items-center gap-3">
              <span class="login-dot"></span>
              <span class="text-muted">More visibility for resident entrepreneurs</span>
            </div>

            <div class="d-flex items-center gap-3">
              <span class="login-dot"></span>
              <span class="text-muted">More convenience for people living in the condo</span>
            </div>
          </div>

          <mat-card appearance="outlined" class="surface-card p-6">
            <mat-card-content class="p-0">
              <div class="d-flex flex-col gap-2">
                <strong>Real world example</strong>
                <p class="login-copy m-0">
                  One resident cuts hair, another sells sweets, another offers maintenance.
                  With the board, everyone becomes visible to neighbors and closes more deals.
                </p>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <mat-card class="login-panel surface-card--elevated p-4">
          <mat-card-header class="p-0 m-b-4">
            <mat-card-title>Sign in</mat-card-title>
            <mat-card-subtitle>Access your account and see what is available in your condo.</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="p-0 d-flex flex-col gap-5">
            <button
              mat-stroked-button
              type="button"
              class="w-full"
              (click)="onGoogleLogin()"
              [disabled]="loading"
            >
              {{ loading ? 'Redirecting...' : 'Continue with Google' }}
            </button>

            <div class="d-flex items-center gap-4">
              <mat-divider class="w-full"></mat-divider>
              <span class="text-muted">or</span>
              <mat-divider class="w-full"></mat-divider>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="d-flex flex-col gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="you@example.com" />
                @if (form.controls.email.touched && form.controls.email.invalid) {
                  <mat-error>Please enter a valid email.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="Your password" />
                @if (form.controls.password.touched && form.controls.password.invalid) {
                  <mat-error>Please enter your password.</mat-error>
                }
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="w-full"
                [disabled]="form.invalid || loading"
              >
                {{ loading ? 'Signing in...' : 'Sign in with email' }}
              </button>
            </form>

          </mat-card-content>

          <div class="d-flex justify-content-start gap-4 m-t-4">
            <a class="m-t-10 text-muted" routerLink="/register">Do not have an account? Create one</a>
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
  private readonly snackBarService = inject(SnackBarService);
  private readonly router = inject(Router);

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
      await this.router.navigateByUrl('/dashboard');
    }
  }

  async onGoogleLogin(): Promise<void> {
    this.loading = true;

    try {
      await this.authService.loginWithGoogle();
    } catch (error: any) {
      if (
        error?.message?.includes('already a signed in user') ||
        error?.name === 'UserAlreadyAuthenticatedException'
      ) {
        await this.router.navigateByUrl('/dashboard');
        return;
      }

      this.presentError(this.resolveErrorMessage(error));
      this.loading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading = true;

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.loginWithEmail(email, password);
      await this.router.navigateByUrl('/dashboard');
    } catch (error: any) {
      if (
        error?.message?.includes('already a signed in user') ||
        error?.name === 'UserAlreadyAuthenticatedException'
      ) {
        await this.router.navigateByUrl('/dashboard');
        return;
      }

      this.presentError(this.resolveErrorMessage(error));
    } finally {
      this.loading = false;
    }
  }

  private resolveErrorMessage(error: unknown): string {
    const e = error as { message?: string; __type?: string; errors?: Array<{ message?: string }> };
    return (
      e?.message?.trim() ||
      e?.errors?.[0]?.message?.trim() ||
      (e?.__type ? `${e.__type}` : '') ||
      'Unable to process request.'
    );
  }

  private presentError(message: string): void {
    setTimeout(() => this.snackBarService.error(message));
  }
}
