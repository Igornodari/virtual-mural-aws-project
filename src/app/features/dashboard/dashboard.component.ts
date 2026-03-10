import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <section class="dashboard-wrapper">
      <header class="dashboard-header">
        <div>
          <div class="app-badge">Condo board</div>
          <h1 class="m-t-3">Welcome to your workspace</h1>
          <p class="text-muted m-t-2">
            Your assets and global style system are now active across the application.
          </p>
        </div>
        <button mat-stroked-button color="primary" (click)="onLogout()">Sign out</button>
      </header>

      <mat-card class="surface-card--elevated">
        <mat-card-header>
          <mat-card-title>Authenticated session</mat-card-title>
          <mat-card-subtitle>User data returned by Cognito</mat-card-subtitle>
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
      }

      pre {
        overflow: auto;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  userData: unknown = null;

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getUser();
    const idToken = await this.authService.getIdToken();

    this.userData = {
      user,
      idToken,
    };
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
