import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';
import { AppointmentApiService } from 'src/app/core/services/appointment-api.service';

@Component({
  selector: 'app-payment-success',
  imports: [...importBase],
  template: `
    <div class="ps-page">
      <div class="ps-card">

        <!-- Ícone animado -->
        <div class="ps-icon-ring">
          <div class="ps-icon-circle">
            <mat-icon class="ps-check-icon">check</mat-icon>
          </div>
        </div>

        <!-- Textos -->
        <h1 class="ps-title">{{ 'PAYMENT.SUCCESS.TITLE' | translate }}</h1>
        <p class="ps-subtitle">{{ 'PAYMENT.SUCCESS.MESSAGE' | translate }}</p>

        <!-- Verificando status -->
        @if (isVerifying()) {
          <div class="ps-verifying d-flex align-items-center gap-10">
            <mat-spinner diameter="18" />
            <span>{{ 'PAYMENT.SUCCESS.VERIFYING' | translate }}</span>
          </div>
        }

        @if (verifyError()) {
          <p class="ps-warn">{{ 'PAYMENT.SUCCESS.VERIFY_ERROR' | translate }}</p>
        }

        <!-- Botão -->
        <button
          mat-raised-button
          color="primary"
          class="ps-btn"
          [disabled]="isVerifying()"
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

    /* Anel pulsante em volta do ícone */
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
      50%       { box-shadow: 0 0 0 12px rgba(76,175,80,0); }
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

    .ps-verifying {
      font-size: 0.85rem;
      color: var(--mat-sys-on-surface-variant, #888);
    }

    .ps-warn {
      margin: 0;
      font-size: 0.82rem;
      color: var(--mat-sys-on-surface-variant, #999);
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
export class PaymentSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentApi = inject(AppointmentApiService);

  readonly isVerifying = signal(false);
  readonly verifyError = signal(false);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      this.verifySession(sessionId);
    }
  }

  private verifySession(sessionId: string): void {
    this.isVerifying.set(true);
    this.appointmentApi.verifyPaymentSession(sessionId).pipe(
      finalize(() => this.isVerifying.set(false)),
    ).subscribe({
      error: () => this.verifyError.set(true),
    });
  }

  goToDashboard(): void {
    this.router.navigate([ROUTE_PATHS.muralCustomer]);
  }
}
