import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NavigationEnd, Router} from '@angular/router';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';
import { BottomNavComponent } from 'src/app/components/bottom-nav/bottom-nav.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';
import { filter } from 'rxjs/operators';
import { importBase } from 'src/app/shared/constant/import-base.constant';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    ...importBase,
    MuralTopbarComponent,
    BottomNavComponent,
  ],
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],
})
export class FullComponent {
  private readonly authService = inject(AuthService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);

  /** Flag opt-in: indica que o usuário ativou o modo prestador. */
  isProvider = signal(false);
  /** Indica se a rota atual está dentro de /mural/provider. */
  isProviderRouteActive = signal(false);
  userName = signal('');
  isMobile = signal(false);

  /**
   * Modo "ativo" no topbar/bottom-nav: 'provider' quando o usuário é
   * prestador e está navegando dentro de /mural/provider; caso contrário
   * 'customer'. Usado para destacar visualmente em qual papel o usuário
   * está agindo no momento.
   */
  readonly activeMode = computed<'provider' | 'customer'>(() =>
    this.isProvider() && this.isProviderRouteActive() ? 'provider' : 'customer',
  );

  readonly providerDashboardLink = ROUTE_PATHS.muralProvider;
  readonly customerDashboardLink = ROUTE_PATHS.muralCustomer;
  readonly profilePath = ROUTE_PATHS.profile;
  readonly appointmentsPath = ROUTE_PATHS.muralAppointments;

  constructor() {
    this.authService.$user
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.userName.set(user?.givenName || user?.displayName || '');
      });

    this.onboardingService.profile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        this.isProvider.set(profile.isProvider);
      });

    this.onboardingService
      .syncFromBackend()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });

    // Observa a rota para destacar o modo ativo (morador vs prestador).
    this.isProviderRouteActive.set(this.router.url.startsWith(ROUTE_PATHS.muralProvider));
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.isProviderRouteActive.set(event.urlAfterRedirects.startsWith(ROUTE_PATHS.muralProvider));
      });
  }

  /**
   * Link "principal" do dashboard atual. Quando o usuário está em modo
   * prestador (navegando em /mural/provider), mantém o link de prestador;
   * caso contrário, aponta para o dashboard de morador.
   */
  dashboardLink(): string {
    return this.activeMode() === 'provider'
      ? ROUTE_PATHS.muralProvider
      : ROUTE_PATHS.muralCustomer;
  }

  profileLink(): string {
    return ROUTE_PATHS.profile;
  }

  appointmentsLink(): string {
    return ROUTE_PATHS.muralAppointments;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate([ROUTE_PATHS.login]);
  }
}
