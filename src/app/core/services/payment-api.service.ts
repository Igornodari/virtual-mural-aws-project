import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralApiService } from './mural-api.service';

export interface ConnectOnboardingResponse {
  onboardingUrl: string;
  accountId: string;
}

export interface ConnectStatusResponse {
  hasAccount: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: 'not_connected' | 'pending' | 'active';
}

export interface DashboardLinkResponse {
  dashboardUrl: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  constructor(private readonly api: MuralApiService) {}

  /**
   * Inicia o onboarding Stripe Connect para o prestador.
   * Retorna a URL de onboarding para redirecionar o prestador.
   */
  startOnboarding(
    refreshUrl: string,
    returnUrl: string,
  ): Observable<ConnectOnboardingResponse> {
    return this.api.post<ConnectOnboardingResponse>('/payments/connect/onboard', {
      refreshUrl,
      returnUrl,
    });
  }

  /**
   * Retorna o status da conta Stripe Connect do prestador.
   */
  getConnectStatus(): Observable<ConnectStatusResponse> {
    return this.api.get<ConnectStatusResponse>('/payments/connect/status');
  }

  /**
   * Gera o link do dashboard Stripe Express do prestador.
   */
  getDashboardLink(): Observable<DashboardLinkResponse> {
    return this.api.get<DashboardLinkResponse>('/payments/connect/dashboard');
  }
}
