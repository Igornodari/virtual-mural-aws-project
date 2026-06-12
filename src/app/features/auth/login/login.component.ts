import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import BaseComponent from '../../../shared/components/base-component/base.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { importBase } from 'src/app/shared/constant/import-base.constant';

@Component({
  selector: 'app-login',
  imports: [...importBase],
  templateUrl: './login.component.html',
  styles: [
    `
      :host {
        display: block;
      }

      /*
       * Paleta laranja/branco — primary token (--mat-sys-primary) é
       * rgb(250, 137, 107). Mantemos a imagem de fundo, mas trocamos o
       * overlay escuro por um gradiente laranja claro → branco para que
       * o painel fique sobre fundo claro com texto escuro (contraste AA).
       */
      .app-auth-page {
        position: relative;
        min-height: 100vh;
        background-image: url('/assets/images/backgrounds/login_background.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        overflow: hidden;
      }

      .app-auth-page::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 247, 240, 0.92) 0%,
          rgba(254, 233, 220, 0.88) 45%,
          rgba(255, 255, 255, 0.96) 100%
        );
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        pointer-events: none;
        z-index: 0;
      }

      .app-auth-page > * {
        position: relative;
        z-index: 1;
      }

      .login-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 1rem;
        max-width: 600px;
        margin-inline: auto;
      }

      .login-hero-badge {
        margin-top: 0.25rem;
        background: var(--mat-sys-primary);
        color: #ffffff;
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      /*
       * Hero text: cinza-escuro #1f2937 sobre fundo claro = contraste >= 12:1.
       * O acento usa a cor primária (laranja) só na palavra-chave para criar
       * hierarquia sem comprometer leitura.
       */
      .login-title {
        font: var(--mat-sys-headline-medium);
        line-height: 1.2;
        letter-spacing: -0.02em;
        color: #1f2937;
        text-shadow: none;
      }

      .login-panel {
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
        background: #ffffff;
        border: 1px solid rgba(250, 137, 107, 0.25);
        box-shadow:
          0 12px 36px rgba(250, 137, 107, 0.18),
          0 2px 8px rgba(15, 23, 42, 0.06);
      }

      .login-panel ::ng-deep .mat-mdc-card-title {
        color: #1f2937;
        font-weight: 700;
      }

      .login-panel ::ng-deep .mat-mdc-card-subtitle {
        color: #4b5563;
      }

      /*
       * O .text-muted padrão (--mat-sys-on-surface-variant) ficava com
       * contraste ruim contra o painel branco. Forçamos um cinza médio
       * (#4b5563) que mantém AA contra branco.
       */
      .login-panel .text-muted,
      .login-panel ::ng-deep .text-muted {
        color: #4b5563;
      }

      @media (max-width: 960px) {
        .login-panel {
          max-width: 100%;
        }
      }

      @media (max-width: 600px) {
        .login-hero {
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .login-title {
          font: var(--mat-sys-title-large);
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

    this.setLoadingState(true);

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.loginWithEmail(email, password);
      await this.redirectAfterLogin();
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name ?? '';
      const message = (err as { message?: string })?.message ?? '';

      if (name === 'UserNotConfirmedException') {
        const email = this.form.controls.email.value;
        this.snackBar.warning(this.translateService.instant('AUTH.CONFIRM_EMAIL.NOT_CONFIRMED_WARNING'));
        await this.navigateTo(`/confirm-email?email=${encodeURIComponent(email)}`);
        return;
      }

      // Demais erros: exibe via snackbar usando a mensagem mapeada pelo AuthService
      this.snackBar.error(message || 'Não foi possível entrar. Tente novamente.');
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
