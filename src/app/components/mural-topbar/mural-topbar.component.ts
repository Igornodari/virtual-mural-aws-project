import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { NotificationBellComponent } from '../notifications/notification-bell.component';

export type TopbarActiveMode = 'provider' | 'customer';

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
    NotificationBellComponent,
  ],
  templateUrl: './mural-topbar.component.html',
  styleUrls: ['./mural-topbar.component.scss'],
})
export class MuralTopbarComponent {
  /**
   * Se o usuário ativou o modo prestador. Quando false, o toggle de
   * modo no topbar não é exibido (o usuário ainda não é prestador).
   */
  @Input({ required: true }) isProvider = false;

  /**
   * Modo atualmente ativo, baseado na rota: 'provider' quando navegando
   * em /mural/provider, 'customer' caso contrário. Usado para destacar
   * visualmente o toggle.
   */
  @Input({ required: true }) activeMode: TopbarActiveMode = 'customer';

  @Input({ required: true }) customerLink = '';
  @Input({ required: true }) providerLink = '';
  @Input() userName = '';
  @Output() logout = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  switchMode(mode: TopbarActiveMode): void {
    if (mode === this.activeMode) {
      return;
    }
    this.router.navigateByUrl(mode === 'provider' ? this.providerLink : this.customerLink);
  }
}
