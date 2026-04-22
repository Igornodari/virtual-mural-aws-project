import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
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
      titleKey: 'APP.ONBOARDING.ROLE.PROVIDER.TITLE',
      subtitleKey: 'APP.ONBOARDING.ROLE.PROVIDER.SUBTITLE',
      color: '#7c3aed',
      featureKeys: [
        'APP.ONBOARDING.ROLE.PROVIDER.F1',
        'APP.ONBOARDING.ROLE.PROVIDER.F2',
        'APP.ONBOARDING.ROLE.PROVIDER.F3',
        'APP.ONBOARDING.ROLE.PROVIDER.F4',
      ],
    },
    {
      value: 'customer',
      icon: 'search',
      titleKey: 'APP.ONBOARDING.ROLE.CUSTOMER.TITLE',
      subtitleKey: 'APP.ONBOARDING.ROLE.CUSTOMER.SUBTITLE',
      color: '#0284c7',
      featureKeys: [
        'APP.ONBOARDING.ROLE.CUSTOMER.F1',
        'APP.ONBOARDING.ROLE.CUSTOMER.F2',
        'APP.ONBOARDING.ROLE.CUSTOMER.F3',
        'APP.ONBOARDING.ROLE.CUSTOMER.F4',
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

    this.onboardingService.saveRole(role).pipe(
      finalize(() => this.setLoadingState(false)),
    ).subscribe({
      next: () => {
        this.navigateTo(destination);
      },
      error: () => {
        this.navigateTo(destination);
      },
    });
  }
}
