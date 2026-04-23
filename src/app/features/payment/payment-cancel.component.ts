import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

@Component({
  selector: 'app-payment-cancel',
  imports: [...importBase],
  template: `
    <div class="payment-result-page d-flex flex-col align-items-center justify-content-center gap-30">
      <div class="payment-result-card surface-card d-flex flex-col align-items-center gap-20 text-center">
        <div class="payment-result-icon payment-result-icon--cancel">
          <mat-icon>cancel</mat-icon>
        </div>

        <div class="d-flex flex-col gap-10">
          <h1 class="payment-result-title m-0">
            {{ 'PAYMENT.CANCEL.TITLE' | translate }}
          </h1>
          <p class="text-muted m-0">
            {{ 'PAYMENT.CANCEL.MESSAGE' | translate }}
          </p>
        </div>

        <div class="d-flex gap-10 flex-wrap justify-content-center">
          <button mat-stroked-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            {{ 'PAYMENT.CANCEL.TRY_AGAIN' | translate }}
          </button>
          <button mat-raised-button color="primary" (click)="goToDashboard()">
            <mat-icon>home</mat-icon>
            {{ 'PAYMENT.GO_TO_DASHBOARD' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-result-page {
      min-height: 100vh;
      padding: 24px;
      background: var(--bg-default, #f5f5f5);
    }

    .payment-result-card {
      max-width: 440px;
      width: 100%;
      padding: 40px 32px;
      border-radius: 16px;
    }

    .payment-result-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }

    .payment-result-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .payment-result-icon--cancel {
      background: rgba(244, 67, 54, 0.12);
      color: #f44336;
    }

    .payment-result-title {
      font-size: 1.5rem;
      font-weight: 600;
    }
  `],
})
export class PaymentCancelComponent {
  private readonly router = inject(Router);

  goBack(): void {
    window.history.back();
  }

  goToDashboard(): void {
    this.router.navigate([ROUTE_PATHS.muralCustomer]);
  }
}
