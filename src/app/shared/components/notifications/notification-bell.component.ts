import {
  Component,
  HostListener,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationPanelComponent } from './notification-panel.component';
import { NotificationCenterService } from 'src/app/core/services/notification-center.service';

/**
 * Sino de notificações exibido no topbar.
 *
 * Características mobile-first:
 *  - Touch target ≥ 44px (mat-icon-button respeita)
 *  - Badge com número (ou "9+") sempre visível
 *  - Em desktop o painel abre como dropdown ancorado
 *  - Em mobile (≤ 768px) o painel vira bottom sheet via CSS
 *
 * O service centraliza estado — qualquer componente do app que
 * mostre badge (ex: bottom-nav) lê o mesmo signal.
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
    TranslateModule,
    NotificationPanelComponent,
  ],
  template: `
    <div class="notif-bell" #host>
      <button
        mat-icon-button
        type="button"
        [attr.aria-label]="'NOTIFICATIONS.BELL.ARIA_LABEL' | translate"
        [matTooltip]="'NOTIFICATIONS.PANEL.TITLE' | translate"
        (click)="onToggle($event)"
      >
        <mat-icon
          [matBadge]="center.badge() || null"
          matBadgeColor="warn"
          matBadgeSize="small"
          [matBadgeHidden]="center.unread() === 0"
          aria-hidden="true"
        >
          notifications
        </mat-icon>
      </button>

      @if (center.open()) {
        <app-notification-panel (closed)="center.setOpen(false)" />
      }
    </div>
  `,
  styles: [
    `
      .notif-bell {
        position: relative;
        display: inline-flex;
      }
    `,
  ],
})
export class NotificationBellComponent {
  protected readonly center = inject(NotificationCenterService);
  @ViewChild('host') hostRef!: ElementRef<HTMLElement>;

  onToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.center.toggle();
  }

  /**
   * Fecha o painel quando o usuário clica fora. O painel também tem
   * seu próprio botão de fechar para mobile.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.center.open()) return;
    const target = event.target as Node;
    if (this.hostRef?.nativeElement.contains(target)) return;

    // Permite clicks dentro do painel — o painel está em outro nó
    // visual mas precisa do mesmo escopo. Como o painel é child do
    // host, este check acima já cobre.
    this.center.setOpen(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.center.setOpen(false);
  }
}
