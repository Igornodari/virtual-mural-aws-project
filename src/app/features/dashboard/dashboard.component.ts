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
  templateUrl: './dashboard.component.html',
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
