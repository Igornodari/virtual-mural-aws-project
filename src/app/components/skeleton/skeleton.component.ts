import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de skeleton loading reutilizável.
 * Exibe blocos animados no lugar do conteúdo enquanto os dados são carregados.
 *
 * @example
 * <!-- Skeleton de card de serviço -->
 * <app-skeleton variant="service-card" [count]="3" />
 *
 * <!-- Skeleton de linha de texto -->
 * <app-skeleton variant="text" [count]="4" />
 *
 * <!-- Skeleton de stat card -->
 * <app-skeleton variant="stat" [count]="4" />
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (item of items; track $index) {
      @switch (variant) {
        @case ('service-card') {
          <div class="skeleton-card">
            <div class="skeleton-line w-60 h-20"></div>
            <div class="skeleton-line w-40 h-14 mt-8"></div>
            <div class="skeleton-line w-full h-12 mt-4"></div>
            <div class="skeleton-line w-full h-12 mt-4"></div>
            <div class="skeleton-line w-80 h-12 mt-4"></div>
            <div class="skeleton-chips mt-12">
              <div class="skeleton-chip"></div>
              <div class="skeleton-chip"></div>
              <div class="skeleton-chip"></div>
            </div>
            <div class="skeleton-footer mt-12">
              <div class="skeleton-line w-24 h-32"></div>
              <div class="skeleton-line w-32 h-32"></div>
            </div>
          </div>
        }
        @case ('stat') {
          <div class="skeleton-stat">
            <div class="skeleton-icon"></div>
            <div class="skeleton-stat-text">
              <div class="skeleton-line w-40 h-28"></div>
              <div class="skeleton-line w-60 h-14 mt-6"></div>
            </div>
          </div>
        }
        @case ('text') {
          <div class="skeleton-text-block">
            <div class="skeleton-line w-full h-14 mt-8"></div>
          </div>
        }
        @case ('profile-header') {
          <div class="skeleton-profile-header">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-profile-info">
              <div class="skeleton-line w-48 h-24"></div>
              <div class="skeleton-line w-64 h-14 mt-8"></div>
            </div>
          </div>
        }
        @default {
          <div class="skeleton-line w-full h-14 mt-8"></div>
        }
      }
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    /* ── Animação base ── */
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }

    .skeleton-line,
    .skeleton-icon,
    .skeleton-avatar,
    .skeleton-chip {
      background: var(--mat-sys-outline-variant);
      border-radius: 6px;
      animation: skeleton-pulse 1.6s ease-in-out infinite;
    }

    /* ── Utilitários de tamanho ── */
    .w-full  { width: 100%; }
    .w-80    { width: 80%; }
    .w-60    { width: 60%; }
    .w-48    { width: 48%; }
    .w-40    { width: 40%; }
    .w-32    { width: 32px; }
    .w-24    { width: 24px; }
    .h-32    { height: 32px; }
    .h-28    { height: 28px; }
    .h-24    { height: 24px; }
    .h-20    { height: 20px; }
    .h-14    { height: 14px; }
    .h-12    { height: 12px; }
    .mt-12   { margin-top: 12px; }
    .mt-8    { margin-top: 8px; }
    .mt-6    { margin-top: 6px; }
    .mt-4    { margin-top: 4px; }

    /* ── Skeleton de card de serviço ── */
    .skeleton-card {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      padding: 20px;
      background: var(--mat-sys-surface);
    }

    .skeleton-chips {
      display: flex;
      gap: 8px;
    }
    .skeleton-chip {
      width: 64px;
      height: 24px;
      border-radius: 999px;
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* ── Skeleton de stat ── */
    .skeleton-stat {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      padding: 20px;
      background: var(--mat-sys-surface);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .skeleton-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .skeleton-stat-text {
      flex: 1;
    }

    /* ── Skeleton de texto ── */
    .skeleton-text-block {
      padding: 2px 0;
    }

    /* ── Skeleton de perfil ── */
    .skeleton-profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 0;
    }
    .skeleton-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .skeleton-profile-info {
      flex: 1;
    }
  `],
})
export class SkeletonComponent {
  /** Variante visual do skeleton */
  @Input() variant: 'service-card' | 'stat' | 'text' | 'profile-header' | 'default' = 'default';

  /** Número de skeletons a renderizar */
  @Input() count = 1;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
