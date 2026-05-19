import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MuralTopbarComponent } from 'src/app/shared/components/mural-topbar/mural-topbar.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { OnboardingService } from 'src/app/core/services/onboarding.service';
import { PushSubscriptionService } from 'src/app/core/services/push-subscription.service';
import { UserApiService } from 'src/app/core/services/user-api.service';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import {
  TermsAcceptanceDialogComponent,
  TermsAcceptanceResult,
} from 'src/app/shared/components/terms-acceptance-dialog/terms-acceptance-dialog.component';
import { BottomNavComponent } from 'src/app/shared/components/bottom-nav/bottom-nav.component';

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
  private readonly pushService = inject(PushSubscriptionService);
  private readonly userApi = inject(UserApiService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);

  /** Flag opt-in: indica que o usuario ativou o modo prestador. */
  isProvider = signal(false);
  /** Indica se a rota atual esta dentro de /mural/provider. */
  isProviderRouteActive = signal(false);
  userName = signal('');
  isMobile = signal(false);

  /**
   * Modo "ativo" no topbar/bottom-nav: 'provider' quando o usuario e
   * prestador e esta navegando dentro de /mural/provider; caso contrario
   * 'customer'.
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

    // Sincroniza o perfil e, na primeira sessao apos o lancamento,
    // exibe o modal de aceite dos termos para quem ainda nao aceitou.
    this.onboardingService
      .syncFromBackend()
      .pipe(
        switchMap((userProfile) => {
          if (!userProfile.termsAcceptedAt) {
            return this.openTermsDialog();
          }
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    void this.pushService.detect();

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });

    this.isProviderRouteActive.set(
      this.router.url.startsWith(ROUTE_PATHS.muralProvider),
    );
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.isProviderRouteActive.set(
          event.urlAfterRedirects.startsWith(ROUTE_PATHS.muralProvider),
        );
      });
  }

  /**
   * Abre o modal de consentimento. Se o usuario aceitar, registra o
   * aceite no backend. Se recusar, faz logout.
   */
  private openTermsDialog() {
    const ref = this.dialog.open<
      TermsAcceptanceDialogComponent,
      void,
      TermsAcceptanceResult
    >(TermsAcceptanceDialogComponent, {
      disableClose: true,
      width: '480px',
      maxWidth: '95vw',
    });

    return ref.afterClosed().pipe(
      switchMap((result) => {
        if (result === 'accepted') {
          // Após o aceite, re-sincroniza o perfil local para que
          // termsAcceptedAt seja gravado e o modal não reabra em
          // navegações subsequentes.
          return this.userApi.acceptTerms().pipe(
            switchMap(() => this.onboardingService.syncFromBackend()),
          );
        }
        // Recusou — faz logout
        this.authService.logout();
        void this.router.navigate([ROUTE_PATHS.login]);
        return of(null);
      }),
    );
  }

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
    void this.router.navigate([ROUTE_PATHS.login]);
  }
}
