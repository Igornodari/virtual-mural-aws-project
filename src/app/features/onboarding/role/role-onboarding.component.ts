import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../../components/base.component';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { UserRole } from '../../../shared/types';

interface RoleOption {
  value: UserRole;
  icon: string;
  titleKey: string;
  subtitleKey: string;
  featureKeys: string[];
  color: string;
}

@Component({
  selector: 'app-role-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="app-auth-page">
      <div class="role-shell">
        <div class="role-header">
          <span class="app-badge">{{ 'APP.TOPBAR.BRAND' | translate }}</span>
          <h1 class="m-t-3 m-b-1">{{ 'APP.ONBOARDING.ROLE_TITLE' | translate }}</h1>
          <p class="text-muted m-0">{{ 'APP.ONBOARDING.ROLE_SUBTITLE' | translate }}</p>
        </div>

        <div class="role-grid">
          @for (option of roleOptions; track option.value) {
            <button
              class="role-card"
              [class.role-card--selected]="selected() === option.value"
              [style.--role-color]="option.color"
              (click)="select(option.value)"
              type="button"
            >
              <div class="role-card__icon-wrap">
                <mat-icon class="role-card__icon">{{ option.icon }}</mat-icon>
              </div>
              <div class="role-card__body">
                <strong class="role-card__title">{{ option.titleKey | translate }}</strong>
                <p class="role-card__subtitle text-muted">{{ option.subtitleKey | translate }}</p>
                <ul class="role-card__features">
                  @for (feat of option.featureKeys; track feat) {
                    <li>
                      <mat-icon class="feat-icon">check_circle</mat-icon>
                      <span>{{ feat | translate }}</span>
                    </li>
                  }
                </ul>
              </div>
              @if (selected() === option.value) {
                <mat-icon class="role-card__check">check_circle</mat-icon>
              }
            </button>
          }
        </div>

        <button
          mat-raised-button
          color="primary"
          class="confirm-btn"
          [disabled]="!selected() || loading"
          (click)="onConfirm()"
        >
          @if (loading) {
            <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
          } @else {
            {{ 'APP.ONBOARDING.CONFIRM_ROLE' | translate }}
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .role-shell {
      width: min(760px, 100%);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .role-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .role-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 28px 24px;
      border-radius: 16px;
      border: 2px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    }
    .role-card:hover {
      border-color: var(--role-color, var(--mat-sys-primary));
      box-shadow: 0 8px 28px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    .role-card--selected {
      border-color: var(--role-color, var(--mat-sys-primary));
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--role-color, var(--mat-sys-primary)) 25%, transparent);
      background: color-mix(in oklab, var(--role-color, var(--mat-sys-primary)) 6%, var(--mat-sys-surface));
    }
    .role-card__icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: color-mix(in oklab, var(--role-color, var(--mat-sys-primary)) 15%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .role-card__icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--role-color, var(--mat-sys-primary));
    }
    .role-card__body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .role-card__title {
      font-size: 18px;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }
    .role-card__subtitle {
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }
    .role-card__features {
      list-style: none;
      padding: 0;
      margin: 8px 0 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .role-card__features li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }
    .feat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--role-color, var(--mat-sys-primary));
    }
    .role-card__check {
      position: absolute;
      top: 16px;
      right: 16px;
      color: var(--role-color, var(--mat-sys-primary));
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .confirm-btn {
      width: 100%;
      height: 52px;
      font-size: 16px;
    }
    .btn-spinner {
      display: inline-block;
    }
    @media (max-width: 600px) {
      .role-shell {
        gap: 20px;
      }
      .role-grid {
        grid-template-columns: 1fr;
      }
      .role-card {
        padding: 20px 16px;
        flex-direction: row;
        align-items: flex-start;
      }
      .role-card__icon-wrap {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
      }
      .role-card__icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
      .role-card__title {
        font-size: 16px;
      }
      .confirm-btn {
        height: 48px;
        font-size: 15px;
      }
    }
  `],
})
export class RoleOnboardingComponent extends BaseComponent {
  private readonly onboardingService = inject(OnboardingService);

  selected = signal<UserRole | null>(null);

  readonly roleOptions: RoleOption[] = [
    {
      value: 'provider',
      icon: 'handyman',
      titleKey: 'APP.ONBOARDING.ROLE_PROVIDER_TITLE',
      subtitleKey: 'APP.ONBOARDING.ROLE_PROVIDER_SUBTITLE',
      color: '#7c3aed',
      featureKeys: [
        'APP.ONBOARDING.ROLE_PROVIDER_F1',
        'APP.ONBOARDING.ROLE_PROVIDER_F2',
        'APP.ONBOARDING.ROLE_PROVIDER_F3',
        'APP.ONBOARDING.ROLE_PROVIDER_F4',
      ],
    },
    {
      value: 'customer',
      icon: 'search',
      titleKey: 'APP.ONBOARDING.ROLE_CUSTOMER_TITLE',
      subtitleKey: 'APP.ONBOARDING.ROLE_CUSTOMER_SUBTITLE',
      color: '#0284c7',
      featureKeys: [
        'APP.ONBOARDING.ROLE_CUSTOMER_F1',
        'APP.ONBOARDING.ROLE_CUSTOMER_F2',
        'APP.ONBOARDING.ROLE_CUSTOMER_F3',
        'APP.ONBOARDING.ROLE_CUSTOMER_F4',
      ],
    },
  ];

  constructor() {
    super();
  }

  select(role: UserRole): void {
    this.selected.set(role);
  }

  async onConfirm(): Promise<void> {
    const role = this.selected();
    if (!role) {
      return;
    }

    this.setLoadingState(true);
    const destination = this.onboardingService.resolveDashboardRoute(role);

    this.onboardingService.saveRole(role).subscribe({
      next: () => {
        this.setLoadingState(false);
        this.navigateTo(destination);
      },
      error: () => {
        this.setLoadingState(false);
        this.navigateTo(destination);
      },
    });
  }
}
