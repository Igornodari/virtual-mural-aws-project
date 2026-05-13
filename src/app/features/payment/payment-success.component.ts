import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { AppointmentApiService } from 'src/app/core/services/appointment-api.service';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

/**
 * Tela de retorno do Stripe Checkout.
 *
 * Antes era apenas estática: o Stripe mandava o usuário para cá com
 * `?session_id=...`, mas a página NÃO chamava `verifyPaymentSession`.
 * O backend dependia exclusivamente do webhook (ou do
 * `syncPendingPaymentsForCustomer` ao listar /appointments/mine), e na
 * prática o status do agendamento ficava preso em `awaiting_payment`.
 *
 * Agora a página dispara `verifyPaymentSession` no `ngOnInit`, garantindo
 * que o agendamento vire `paid` antes do usuário voltar ao dashboard.
 */
@Component({
  selector: 'app-payment-success',
  imports: [...importBase],
  template: `
    <div class="ps-page">
      <div class="ps-card">
        <div
          class="ps-icon-ring"
          [class.ps-icon-ring--verifying]="isVerifying"
          [class.ps-icon-ring--error]="hasError"
        >
          <div class="ps-icon-circle">
            @if (isVerifying) {
              <mat-spinner [diameter]="32" mode="indeterminate" class="ps-spinner"></mat-spinner>
            } @else if (hasError) {
              <mat-icon class="ps-check-icon">priority_high</mat-icon>
            } @else {
              <mat-icon class="ps-check-icon">check</mat-icon>
            }
          </div>
        </div>

        <h1 class="ps-title">
          @if (isVerifying) {
            {{ 'PAYMENT.SUCCESS.VERIFYING' | translate }}
          } @else if (hasError) {
            {{ 'PAYMENT.SUCCESS.ERROR_TITLE' | translate }}
          } @else {
            {{ 'PAYMENT.SUCCESS.TITLE' | translate }}
          }
        </h1>

        @if (isVerifying) {
          <p class="ps-subtitle">
            Estamos confirmando seu pagamento com o Stripe.
            Isso leva apenas alguns segundos.
          </p>
        } @else if (hasError) {
          <p class="ps-subtitle">
            Não foi possível confirmar o pagamento neste momento.
            Verifique seus agendamentos no painel — o status será
            atualizado automaticamente em instantes.
          </p>
        } @else {
          <p class="ps-subtitle">
            Seu pagamento foi confirmado e o agendamento está pago.
          </p>
        }

        <button
          mat-raised-button
          color="primary"
          class="ps-btn"
          [disabled]="isVerifying"
          (click)="goToDashboard()"
        >
          <mat-icon>home</mat-icon>
          {{ 'PAYMENT.GO_TO_DASHBOARD' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ps-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: linear-gradient(
          135deg,
          rgba(255, 247, 240, 0.95) 0%,
          rgba(254, 233, 220, 0.9) 100%
        );
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
        background: #ffffff;
        border: 1px solid rgba(250, 137, 107, 0.18);
        box-shadow:
          0 12px 36px rgba(250, 137, 107, 0.16),
          0 2px 8px rgba(15, 23, 42, 0.05);
        text-align: center;
      }

      .ps-icon-ring {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: rgba(76, 175, 80, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: ring-pulse 2s ease-in-out infinite;

        &--verifying {
          background: rgba(250, 137, 107, 0.18);
        }

        &--error {
          background: rgba(245, 158, 11, 0.18);
        }
      }

      .ps-icon-ring--verifying .ps-icon-circle {
        background: var(--mat-sys-primary);
      }

      .ps-icon-ring--error .ps-icon-circle {
        background: #f59e0b;
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

      .ps-spinner ::ng-deep circle {
        stroke: #ffffff;
      }

      @keyframes ring-pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.3);
        }
        50% {
          box-shadow: 0 0 0 12px rgba(76, 175, 80, 0);
        }
      }

      .ps-title {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 700;
        color: #1f2937;
        line-height: 1.2;
      }

      .ps-subtitle {
        margin: 0;
        font-size: 0.95rem;
        color: #4b5563;
        line-height: 1.5;
      }

      .ps-btn {
        margin-top: 8px;
        padding: 0 28px;
        height: 44px;
        border-radius: 22px !important;
        font-size: 0.95rem;
      }
    `,
  ],
})
export class PaymentSuccessComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly appointmentApi = inject(AppointmentApiService);
  private readonly destroyRef = inject(DestroyRef);

  isVerifying = false;
  hasError = false;

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      // Sem session_id (acesso direto à URL): apenas mostra a tela.
      return;
    }

    this.isVerifying = true;
    this.appointmentApi
      .verifyPaymentSession(sessionId)
      .pipe(
        catchError(() => {
          this.hasError = true;
          return of(null);
        }),
        finalize(() => {
          this.isVerifying = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  goToDashboard(): void {
    this.router.navigate([ROUTE_PATHS.muralCustomer]);
  }
}
