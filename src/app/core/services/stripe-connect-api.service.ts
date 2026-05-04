import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

export interface StripeConnectAccountResponse {
  /** ID da conta Stripe Express (campo `accountId` retornado pelo backend) */
  accountId: string;
  onboardingUrl: string;
}

export interface StripeConnectOnboardingLinkResponse {
  onboardingUrl: string;
}

export interface StripeConnectStatusResponse {
  /** null quando o prestador ainda não tem conta Connect */
  accountId: string | null;
  /** null quando não há conta; 'pending' | 'active' | 'restricted' caso contrário */
  status: 'pending' | 'active' | 'restricted' | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface StripeConnectDashboardLinkResponse {
  /** Chave `url` retornada pelo backend */
  url: string;
}

@Injectable({ providedIn: 'root' })
export class StripeConnectApiService {
  private readonly request = inject(RequestService);

  /** Cria ou recupera conta Stripe Connect e retorna URL de onboarding */
  createOrGetAccount(): Observable<StripeConnectAccountResponse> {
    return this.request.post<StripeConnectAccountResponse>('/stripe/connect/account', {});
  }

  /** Gera novo link de onboarding (caso o anterior tenha expirado) */
  createOnboardingLink(): Observable<StripeConnectOnboardingLinkResponse> {
    return this.request.post<StripeConnectOnboardingLinkResponse>(
      '/stripe/connect/onboarding-link',
      {},
    );
  }

  /** Retorna status atual da conta Connect do prestador */
  getStatus(): Observable<StripeConnectStatusResponse> {
    return this.request.get<StripeConnectStatusResponse>('/stripe/connect/status');
  }

  /** Gera link de acesso ao dashboard Stripe Express do prestador */
  createDashboardLink(): Observable<StripeConnectDashboardLinkResponse> {
    return this.request.post<StripeConnectDashboardLinkResponse>(
      '/stripe/connect/dashboard-link',
      {},
    );
  }
}
