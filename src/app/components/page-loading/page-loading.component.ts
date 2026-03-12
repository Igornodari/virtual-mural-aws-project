import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Overlay de loading de tela cheia.
 * Utilizado durante transições de rota, autenticação e carregamento inicial.
 *
 * @example
 * <app-page-loading [visible]="isLoading" message="APP.LOADING.AUTHENTICATING" />
 */
@Component({
  selector: 'app-page-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    @if (visible) {
      <div class="page-loading-overlay" role="status" [attr.aria-label]="message | translate">
        <div class="page-loading-content">
          <div class="page-loading-logo">
            <span class="logo-icon">🏢</span>
          </div>
          <mat-spinner diameter="48" />
          <p class="page-loading-message">{{ message | translate }}</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-loading-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--mat-sys-surface);
      animation: fade-in 0.2s ease;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .page-loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .page-loading-logo {
      font-size: 48px;
      line-height: 1;
      animation: bounce 1.4s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    .page-loading-message {
      margin: 0;
      font-size: 15px;
      color: var(--mat-sys-on-surface-variant);
      font-weight: 500;
      letter-spacing: 0.01em;
    }
  `],
})
export class PageLoadingComponent {
  @Input() visible = true;
  @Input() message = 'APP.LOADING.DEFAULT';
}
