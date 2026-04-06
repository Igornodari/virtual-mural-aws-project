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
  templateUrl: './role-onboarding.component.html',
  styleUrls: ['./role-onboarding.component.scss'],
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
