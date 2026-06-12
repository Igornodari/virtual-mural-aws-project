import {
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationType, NotificationDto } from 'src/app/core/services/notification-api.service';
import { NotificationCenterService } from 'src/app/core/services/notification-center.service';
import { PushSubscriptionService } from 'src/app/core/services/push-subscription.service';

type Tab = 'all' | 'unread';

/**
 * Painel/lista de notificações.
 *
 * Mobile-first: em telas estreitas (≤ 768px) renderizamos como bottom
 * sheet via CSS (`position: fixed; bottom: 0; left/right: 0`). Em
 * desktop o painel ancora-se ao sino como dropdown.
 *
 * Cada item exibe:
 *  - ícone Material baseado no `type`
 *  - severidade colorida (success/warning/error)
 *  - título traduzido + mensagem interpolada
 *  - timestamp relativo (há 5min, há 2h)
 *  - estado "lido / não lido" com indicador visual
 *
 * Clicar marca como lida e navega para `actionUrl`.
 */
@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
})
export class NotificationPanelComponent {
  protected readonly center = inject(NotificationCenterService);
  protected readonly push = inject(PushSubscriptionService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  @Output() closed = new EventEmitter<void>();

  /** Aba ativa — controlamos local. */
  readonly tab = signal<Tab>('all');

  /** True enquanto a inscrição de push está em andamento. */
  readonly pushLoading = signal(false);
  /** Chave i18n do erro ao inscrever, ou null se não houve erro. */
  readonly pushError = signal<string | null>(null);

  readonly visibleItems = computed(() => {
    const items = this.center.items();
    return this.tab() === 'unread' ? items.filter((n) => !n.read) : items;
  });

  /** Ícone Material para cada tipo. */
  iconFor(type: NotificationType): string {
    switch (type) {
      case 'NEW_APPOINTMENT_REQUEST':
        return 'event_available';
      case 'APPOINTMENT_CONFIRMED':
        return 'check_circle';
      case 'APPOINTMENT_REJECTED':
        return 'cancel';
      case 'CUSTOMER_CANCELLED':
      case 'PROVIDER_CANCELLED':
        return 'event_busy';
      case 'APPOINTMENT_REMINDER':
        return 'notifications_active';
      case 'APPOINTMENT_COMPLETED':
        return 'task_alt';
      case 'PAYMENT_CONFIRMED':
        return 'payments';
      case 'PAYMENT_FAILED':
        return 'credit_card_off';
      case 'PAYMENT_PENDING_PROVIDER':
        return 'pending';
      case 'RESCHEDULE_REQUESTED':
      case 'RESCHEDULE_ACCEPTED':
      case 'RESCHEDULE_REJECTED':
        return 'event_repeat';
      case 'NEW_SERVICE_AVAILABLE':
        return 'campaign';
      case 'NEW_REVIEW':
        return 'star';
      default:
        return 'notifications';
    }
  }

  /**
   * Timestamp relativo. Mantemos simples — para UI mais sofisticada,
   * libs como dayjs/date-fns são opções, mas evitamos dependência nova.
   */
  relativeTime(iso: string): string {
    if (!iso) return '';
    const diffMs = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diffMs / 60_000);
    if (min < 1) return this.translate.instant('NOTIFICATIONS.PANEL.JUST_NOW');
    if (min < 60) return this.translate.instant('NOTIFICATIONS.PANEL.MINUTES_AGO', { count: min });
    const hours = Math.floor(min / 60);
    if (hours < 24) return this.translate.instant('NOTIFICATIONS.PANEL.HOURS_AGO', { count: hours });
    const days = Math.floor(hours / 24);
    return this.translate.instant('NOTIFICATIONS.PANEL.DAYS_AGO', { count: days });
  }

  async onItemClick(n: NotificationDto): Promise<void> {
    if (!n.read) {
      void this.center.markAsRead(n.id);
    }
    if (n.actionUrl) {
      await this.router.navigateByUrl(n.actionUrl);
      this.closed.emit();
    }
  }

  async onMarkAllRead(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    await this.center.markAllAsRead();
  }

  async onEnablePush(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    this.pushError.set(null);
    this.pushLoading.set(true);
    try {
      await this.push.subscribe();
    } catch {
      // O status já é atualizado pelo service; aqui damos feedback
      // visível ao usuário em vez de engolir o erro silenciosamente.
      this.pushError.set('NOTIFICATIONS.PANEL.PUSH_ERROR');
    } finally {
      this.pushLoading.set(false);
    }
  }

  vars(n: NotificationDto): Record<string, string> {
    return this.center.vars(n);
  }

  titleKey(n: NotificationDto): string {
    return this.center.titleKey(n);
  }

  messageKey(n: NotificationDto): string {
    return this.center.messageKey(n);
  }
}
