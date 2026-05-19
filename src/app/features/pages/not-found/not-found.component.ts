import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="not-found-code" aria-hidden="true">404</div>

        <mat-icon class="not-found-icon" aria-hidden="true">search_off</mat-icon>

        <h1 class="not-found-title">{{ 'NOT_FOUND.TITLE' | translate }}</h1>
        <p class="not-found-message">{{ 'NOT_FOUND.MESSAGE' | translate }}</p>

        <a mat-flat-button color="primary" [routerLink]="homeLink">
          <mat-icon>home</mat-icon>
          {{ 'NOT_FOUND.GO_HOME' | translate }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: var(--mat-sys-background, #fafafa);
    }

    .not-found-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
      max-width: 400px;
    }

    .not-found-code {
      font-size: 6rem;
      font-weight: 700;
      line-height: 1;
      color: var(--mat-sys-primary, #1A6B6B);
      opacity: 0.15;
    }

    .not-found-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .not-found-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .not-found-message {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.6;
    }

    a[mat-flat-button] {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `],
})
export class NotFoundComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get homeLink(): string {
    return this.authService.isLoggedIn()
      ? ROUTE_PATHS.muralCustomer
      : ROUTE_PATHS.login;
  }
}
