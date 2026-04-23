import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import BaseComponent from '../../components/base.component';
import { SnackBarService } from '../../core/services/snack-bar.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslateModule,
    MatDividerModule
  ],
  templateUrl: './confirm-email.component.html',
  styles: [
    `
      .confirm-panel {
        width: 100%;
        max-width: 480px;
        margin-inline: auto;
      }

      .email-highlight {
        font-weight: 600;
        color: var(--mat-sys-primary);
        word-break: break-all;
      }

      .resend-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .countdown {
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class ConfirmEmailComponent extends BaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(SnackBarService);
  private readonly translateService = inject(TranslateService);

  email = '';
  resendCooldown = 0;
  private cooldownInterval?: ReturnType<typeof setInterval>;

  form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) {
      void this.navigateTo('/register');
    }
  }

  async onConfirm(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.setLoadingState(true);
      await this.authService.confirmEmailCode(this.email, this.form.getRawValue().code);
      this.snackBar.success(this.translateService.instant('AUTH.CONFIRM_EMAIL.SUCCESS'));
      await this.navigateTo('/login');
      this.setLoadingState(false);
  }

  async onResend(): Promise<void> {
    if (this.resendCooldown > 0) return;
      await this.authService.resendConfirmationCode(this.email);
      this.snackBar.success(this.translateService.instant('AUTH.CONFIRM_EMAIL.RESEND_SUCCESS'));
      this.startCooldown(60);
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown = seconds;
    clearInterval(this.cooldownInterval);
    this.cooldownInterval = setInterval(() => {
      this.updateViewState(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          clearInterval(this.cooldownInterval);
        }
      });
    }, 1000);
  }
}
