import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import BaseComponent from '../../components/base.component';
import { OnboardingService } from '../../core/services/onboarding.service';
import { importBase } from 'src/app/shared/constant/import-base.constant';

@Component({
  selector: 'app-login',
  imports: [...importBase],
  templateUrl: './login.component.html',
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

      @media (max-width: 600px) {
        .login-hero {
          display: none;
        }

        .login-panel {
          padding: 16px;
        }
      }
    `,
  ],
})
export class LoginComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly onboardingService = inject(OnboardingService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  errorMessage = '';
  showPassword = false;

  constructor() {
    super();
  }

  async ngOnInit(): Promise<void> {
    const authenticated = await this.authService.isAuthenticated();
    if (authenticated) {
      await this.redirectAfterLogin();
    }
  }

  async onGoogleLogin(): Promise<void> {
    this.errorMessage = '';
    this.setLoadingState(true);
    try {
      await this.authService.loginWithGoogle();
    } catch {
      this.setLoadingState(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.setLoadingState(true);

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.loginWithEmail(email, password);
      await this.redirectAfterLogin();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.';
      this.updateViewState(() => { this.errorMessage = message; });
    } finally {
      this.setLoadingState(false);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private async redirectAfterLogin(): Promise<void> {
    const destination = await firstValueFrom(this.onboardingService.syncAndResolveNextRoute());
    await this.navigateTo(destination);
  }
}
