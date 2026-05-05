import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

@Component({
  selector: 'app-payment-success',
  imports: [...importBase],
  template: `
    <div class="ps-page">
      <div class="ps-card">

        <div class="ps-icon-ring">
          <div class="ps-icon-circle">
            <mat-icon class="ps-check-icon">check</mat-icon>
          </div>
        </div>

        <h1 class="ps-title">{{ 'PAYMENT.SUCCESS.TITLE' | translate }}</h1>

        <p class="ps-subtitle">
          Seu pagamento foi processado pela Stripe. A confirmação do agendamento
          será atualizada automaticamente em alguns instantes.
        </p>

        <p class="ps-warn">
          Caso o status ainda apareça como aguardando pagamento, aguarde alguns segundos
          e atualize seus agendamentos.
        </p>

        <button
          mat-raised-button
          color="primary"
          class="ps-btn"
          (click)="goToDashboard()"
        >
          <mat-icon>home</mat-icon>
          {{ 'PAYMENT.GO_TO_DASHBOARD' | translate }}
        </button>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ps-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: var(--mat-sys-surface-container-lowest, #f8f8f8);
    }

    .ps-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      max-width: 420px;
      width: 100%;
      padding: 48px 40px;
      border-radius: 20px;
      background: var(--mat-sys-surface, #fff);
      box-shadow: 0 8px 32px rgba(0,0,0,.08);
      text-align: center;
    }

    .ps-icon-ring {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: rgba(76,175,80,.15);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: ring-pulse 2s ease-in-out infinite;
    }

    .ps-icon-circle {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: #4caf50;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ps-check-icon {
      font-size: 38px;
      width: 38px;
      height: 38px;
      color: #fff;
    }

    @keyframes ring-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,.3); }
      50% { box-shadow: 0 0 0 12px rgba(76,175,80,0); }
    }

    .ps-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--mat-sys-on-surface);
      line-height: 1.2;
    }

    .ps-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: var(--mat-sys-on-surface-variant, #666);
      line-height: 1.5;
    }

    .ps-warn {
      margin: 0;
      font-size: 0.82rem;
      color: var(--mat-sys-on-surface-variant, #999);
      line-height: 1.5;
    }

    .ps-btn {
      margin-top: 8px;
      padding: 0 28px;
      height: 44px;
      border-radius: 22px !important;
      font-size: 0.95rem;
    }
  `],
})
export class PaymentSuccessComponent {
  private readonly router = inject(Router);

  goToDashboard(): void {
    this.router.navigate([ROUTE_PATHS.muralCustomer]);
  }
}
