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
