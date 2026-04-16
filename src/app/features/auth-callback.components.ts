import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { OnboardingService } from '../core/services/onboarding.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  templateUrl: './auth-callback.components.html',
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
      await this.router.navigateByUrl('/login');
      return;
    }

    // Sincroniza o estado de onboarding com o backend antes de redirecionar.
    // Garante que usuários que já completaram o onboarding em outro dispositivo
    // não sejam redirecionados para as telas de cadastro novamente.
    try {
      await firstValueFrom(this.onboardingService.syncFromBackend());
    } catch {
      // Se a sincronização falhar (ex: backend offline), usa o estado local
    }

    // Redireciona conforme o estado de onboarding do usuário
    if (!this.onboardingService.hasCondominium) {
      await this.router.navigateByUrl('/onboarding/condominium');
      return;
    }

    if (!this.onboardingService.hasRole) {
      await this.router.navigateByUrl('/onboarding/role');
      return;
    }

    // Onboarding completo: redireciona para a dashboard correta
    const destination =
      this.onboardingService.role === 'provider' ? '/mural/provider' : '/mural/customer';
    await this.router.navigateByUrl(destination);
  }
}
