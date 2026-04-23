import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    MuralTopbarComponent,
  ],
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
})
export class FullComponent {
  private readonly authService = inject(AuthService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  userRole = signal<'provider' | 'customer'>('customer');
  userName = signal('');

  constructor() {
    this.authService.$user
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.userName.set(user?.givenName || user?.displayName || '');
      });

    this.onboardingService.profile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        this.userRole.set(profile.role ?? 'customer');
      });

    this.onboardingService
      .syncFromBackend()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  dashboardLink() {
    return this.userRole() === 'provider' ? ROUTE_PATHS.muralProvider : ROUTE_PATHS.muralCustomer;
  }

  profileLink() {
    return ROUTE_PATHS.profile;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate([ROUTE_PATHS.login]);
  }
}
