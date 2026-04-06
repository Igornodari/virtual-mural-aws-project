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
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss'],})
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
