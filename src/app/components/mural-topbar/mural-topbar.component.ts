import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';

export type TopbarRole = 'provider' | 'customer';

/**
 * Topbar reutilizável para as dashboards do Mural do Condomínio.
 * Contém: logo, badge de perfil, nome do usuário, seletor de idioma,
 * toggle de tema dark/light, link para perfil e botão de logout.
 */
@Component({
  selector: 'app-mural-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule,
  ],
  template: `
    <header class="mural-topbar">
      <!-- Marca -->
      <div class="topbar-brand">
        <mat-icon class="brand-icon">{{ role === 'provider' ? 'storefront' : 'dashboard' }}</mat-icon>
        <span class="brand-name">{{ 'APP.TOPBAR.BRAND' | translate }}</span>
        <span class="app-badge" [class]="role === 'provider' ? 'badge--provider' : 'badge--customer'">
          {{ (role === 'provider' ? 'APP.TOPBAR.ROLE_PROVIDER' : 'APP.TOPBAR.ROLE_CUSTOMER') | translate }}
        </span>
      </div>

      <!-- Ações -->
      <div class="topbar-actions">
        <!-- Toggle de tema -->
        <button
          mat-icon-button
          (click)="themeService.toggle()"
          [matTooltip]="(themeService.isDark ? 'APP.TOPBAR.THEME_LIGHT' : 'APP.TOPBAR.THEME_DARK') | translate"
        >
          <mat-icon>{{ themeService.isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- Seletor de idioma -->
        <button mat-button [matMenuTriggerFor]="langMenu" class="lang-btn">
          <mat-icon>language</mat-icon>
          {{ languageService.currentLabel }}
        </button>
        <mat-menu #langMenu="matMenu">
          <button mat-menu-item (click)="languageService.setLanguage('pt')" [class.active-lang]="languageService.language() === 'pt'">
            <mat-icon>check</mat-icon>
            Português
          </button>
          <button mat-menu-item (click)="languageService.setLanguage('en')" [class.active-lang]="languageService.language() === 'en'">
            <mat-icon>check</mat-icon>
            English
          </button>
        </mat-menu>

        <!-- Menu do usuário -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
          <mat-icon>account_circle</mat-icon>
          <span class="user-name text-muted">{{ userName }}</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>manage_accounts</mat-icon>
            {{ 'APP.TOPBAR.MY_PROFILE' | translate }}
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout.emit()">
            <mat-icon>logout</mat-icon>
            {{ 'APP.TOPBAR.LOGOUT' | translate }}
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .mural-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      color: #0284c7;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .brand-name {
      font-weight: 700;
      font-size: 16px;
    }
    .badge--provider {
      background: color-mix(in oklab, #7c3aed 18%, transparent);
      color: #7c3aed;
    }
    .badge--customer {
      background: color-mix(in oklab, #0284c7 18%, transparent);
      color: #0284c7;
    }
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .lang-btn {
      font-size: 13px;
      font-weight: 600;
      gap: 2px;
    }
    .user-btn {
      gap: 4px;
      font-size: 14px;
    }
    .user-name {
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .active-lang {
      color: var(--mat-sys-primary);
      font-weight: 600;
    }
    @media (max-width: 600px) {
      .brand-name { display: none; }
      .user-name { display: none; }
    }
  `],
})
export class MuralTopbarComponent {
  @Input({ required: true }) role!: TopbarRole;
  @Input() userName = '';
  @Output() logout = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
}
