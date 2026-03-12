import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import BaseComponent from '../../components/base.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, TranslateModule],
  template: `
    <section class="dashboard-wrapper">
      <header class="dashboard-header">
        <div>
          <div class="app-badge">{{ 'APP.DASHBOARD.BADGE' | translate }}</div>
          <h1 class="m-t-3">{{ 'APP.DASHBOARD.TITLE' | translate }}</h1>
          <p class="text-muted m-t-2">
            {{ 'APP.DASHBOARD.SUBTITLE' | translate }}
          </p>
        </div>
        <button mat-stroked-button color="primary" (click)="onLogout()">
          {{ 'APP.DASHBOARD.SIGN_OUT' | translate }}
        </button>
      </header>

      <mat-card class="surface-card--elevated">
        <mat-card-header>
          <mat-card-title>{{ 'APP.DASHBOARD.SESSION_TITLE' | translate }}</mat-card-title>
          <mat-card-subtitle>{{ 'APP.DASHBOARD.SESSION_SUBTITLE' | translate }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <pre>{{ userData | json }}</pre>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .dashboard-wrapper {
        max-width: 1080px;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        gap: 16px;
      }

      .dashboard-header {
        display: flex;
        gap: 12px;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      pre {
        overflow: auto;
        white-space: pre-wrap;
      }

      @media (max-width: 600px) {
        .dashboard-wrapper {
          padding: 16px;
        }
        .dashboard-header {
          flex-direction: column;
          align-items: stretch;
        }
        .dashboard-header button {
          width: 100%;
        }
      }
    `,
  ],
})
export class DashboardComponent extends BaseComponent implements OnInit {
  userData: unknown = { status: 'loading-auth-data' };

  constructor() {
    super();
  }

  async ngOnInit(): Promise<void> {
    const authSnapshot = await this.authService.getAuthDebugData();
    this.updateViewState(() => {
      this.userData = authSnapshot;
    });
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
}
