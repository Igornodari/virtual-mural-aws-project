import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MuralTopbarComponent } from '../components/mural-topbar/mural-topbar.component';
import { AuthService } from '../core/services/auth.service';
import { ROUTE_PATHS } from '../shared/constant/route-paths.constant';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    MuralTopbarComponent
  ],
  template: `
    <div class="full-layout">
      <app-mural-topbar
        [role]="userRole()"
        [userName]="userName()"
        (logout)="onLogout()"
      />

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item [routerLink]="dashboardLink()" routerLinkActive="active-link">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>{{ 'APP.MENU.DASHBOARD' | translate }}</span>
            </a>
            <a mat-list-item [routerLink]="profileLink()" routerLinkActive="active-link">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>{{ 'APP.MENU.PROFILE' | translate }}</span>
            </a>
            <!-- Adicione mais itens de menu conforme necessário -->
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .full-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .sidenav-container {
      flex: 1;
    }
    .sidenav {
      width: 250px;
      border-right: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
    }
    .content {
      background: var(--mat-sys-surface-container);
    }
    .main-content {
      padding: 20px;
      height: 100%;
      box-sizing: border-box;
    }
    .active-link {
      background: color-mix(in oklab, var(--mat-sys-primary) 10%, transparent);
      color: var(--mat-sys-primary);
    }
    @media (max-width: 600px) {
      .sidenav {
        width: 70px;
      }
      span[matListItemTitle] {
        display: none;
      }
    }
  `]
})
export class FullComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userRole = signal<'provider' | 'customer'>('customer');
  userName = signal('');

  constructor() {
    const user = this.authService.currentUser;
    if (user) {
      this.userName.set(user.givenName || user.displayName || '');
      // Lógica simples para determinar role baseado no user, ajuste conforme sua implementação real
      // @ts-ignore - A propriedade role pode não existir no tipo User atual, mas é usada na lógica
      this.userRole.set(user.role === 'provider' ? 'provider' : 'customer');
    }
  }

  dashboardLink() {
    return this.userRole() === 'provider' ? ROUTE_PATHS.muralProvider : ROUTE_PATHS.muralCustomer;
  }

  profileLink() {
    return ROUTE_PATHS.profile;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate([ROUTE_PATHS.login]);
  }
}
