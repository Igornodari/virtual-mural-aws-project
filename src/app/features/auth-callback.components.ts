import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { OnboardingService } from '../core/services/onboarding.service';
import { ROUTE_PATHS } from '../shared/constant/route-paths.constant';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;gap:12px;">
      <span style="font-size:16px;color:var(--mat-sys-on-surface-variant)">Finalizando login...</span>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly platformId = inject(PLATFORM_ID);

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const authenticated = await this.authService.isAuthenticated();
    if (!authenticated) {
      await this.router.navigateByUrl(ROUTE_PATHS.login);
      return;
    }

    const destination = await firstValueFrom(this.onboardingService.syncAndResolveNextRoute());
    await this.router.navigateByUrl(destination);
  }
}
