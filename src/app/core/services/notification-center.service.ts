import {
  Injectable,
  Signal,
  computed,
  effect,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import {
  NotificationApiService,
  NotificationDto,
} from './notification-api.service';
import { environment } from '../../../environments/environments';

/**
 * Estado central das notificações in-app.
 *
 * Responsabilidades:
 *  - Carregar lista paginada (last 30)
 *  - Manter contagem de não lidas
 *  - Conectar SSE para receber tempo real enquanto app aberto
 *  - Reconectar SSE automaticamente se a conexão cair
 *  - Resolver i18n (título + mensagem) com interpolação de payload
 *
 * UX mobile-first: o painel pode ficar aberto por minutos enquanto o
 * usuário navega; signals atualizam reativamente sem precisar re-fetch.
 */
@Injectable({ providedIn: 'root' })
export class NotificationCenterService {
  private readonly api = inject(NotificationApiService);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  // ── State ────────────────────────────────────────────────────────────────
  private readonly _items = signal<NotificationDto[]>([]);
  private readonly _unread = signal<number>(0);
  private readonly _loading = signal<boolean>(false);
  private readonly _open = signal<boolean>(false);

  readonly items: Signal<NotificationDto[]> = this._items.asReadonly();
  readonly unread: Signal<number> = this._unread.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly open: Signal<boolean> = this._open.asReadonly();

  /** Badge string para o sino: '', '1'..'9', '9+'. */
  readonly badge = computed(() => {
    const n = this._unread();
    if (n <= 0) return '';
    if (n > 9) return this.translate.instant('NOTIFICATIONS.BELL.BADGE_OVERFLOW');
    return String(n);
  });

  // ── SSE ──────────────────────────────────────────────────────────────────
  private eventSource: EventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;

  constructor() {
    // Conecta/desconecta SSE com base na autenticação.
    this.auth.$user
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user) {
          void this.bootstrap();
        } else {
          this.disconnect();
          this._items.set([]);
          this._unread.set(0);
        }
      });

    // Limpa SSE quando o serviço é destruído.
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  // ── API pública ──────────────────────────────────────────────────────────

  async bootstrap(): Promise<void> {
    await this.refresh();
    this.connectStream();
  }

  /** Carrega as últimas N notificações. */
  async refresh(limit = 30): Promise<void> {
    this._loading.set(true);
    try {
      const res = await firstValueFrom(this.api.list({ limit }));
      this._items.set(res.items);
      this._unread.set(res.unread);
    } finally {
      this._loading.set(false);
    }
  }

  toggle(): void {
    this._open.update((v) => !v);
  }

  setOpen(open: boolean): void {
    this._open.set(open);
  }

  async markAsRead(id: string): Promise<void> {
    // Otimismo: aplica localmente já, e em paralelo confirma no backend.
    this._items.update((items) =>
      items.map((it) =>
        it.id === id ? { ...it, read: true, readAt: new Date().toISOString() } : it,
      ),
    );
    this.recalcUnread();
    await firstValueFrom(this.api.markAsRead(id)).catch(() => this.refresh());
  }

  async markAllAsRead(): Promise<void> {
    this._items.update((items) =>
      items.map((it) => ({ ...it, read: true, readAt: new Date().toISOString() })),
    );
    this._unread.set(0);
    await firstValueFrom(this.api.markAllAsRead()).catch(() => this.refresh());
  }

  // ── i18n helpers (usado pelos componentes) ───────────────────────────────

  titleKey(n: NotificationDto): string {
    return `NOTIFICATIONS.TYPES.${n.type}.TITLE`;
  }

  messageKey(n: NotificationDto): string {
    return `NOTIFICATIONS.TYPES.${n.type}.MESSAGE`;
  }

  /**
   * Variáveis para interpolação. Formatamos data/hora aqui para
   * exibição amigável (24/06/2026, 12:00). O usuário só vê o resultado.
   */
  vars(n: NotificationDto): Record<string, string> {
    const p = n.payload ?? {};
    return {
      customerName: String(p.customerName ?? ''),
      providerName: String(p.providerName ?? ''),
      serviceName: String(p.serviceName ?? ''),
      scheduledDate: this.formatDate(p.scheduledDate as string | undefined),
      scheduledDay: String(p.scheduledDay ?? ''),
      scheduledTime: this.formatTime(p.scheduledTime as string | undefined),
      rating: String(p.rating ?? ''),
      amount: String(p.amount ?? ''),
    };
  }

  private formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const lang = this.translate.currentLang === 'en' ? 'en-US' : 'pt-BR';
    return d.toLocaleDateString(lang);
  }

  private formatTime(hhmm: string | undefined): string {
    if (!hhmm) return '';
    return hhmm.length >= 5 ? hhmm.slice(0, 5) : hhmm;
  }

  // ── SSE wiring ───────────────────────────────────────────────────────────

  /**
   * EventSource não suporta headers — para autenticar a conexão SSE
   * passamos o token como query param. O backend aceita Bearer também,
   * mas o navegador não nos deixa setar headers no EventSource padrão.
   *
   * Em produção, considerar usar fetch + ReadableStream para ter
   * controle total de headers (mais código, mas evita expor token na URL).
   */
  private async connectStream(): Promise<void> {
    if (this.eventSource) return;
    if (typeof window === 'undefined') return; // SSR

    // O backend valida ID tokens Cognito (token_use === 'id'). Como
    // EventSource não suporta headers, passamos via query param.
    const token = await this.auth.getIdToken().catch(() => null);
    if (!token) return;

    const base = environment.apiBaseUrl.replace(/\/$/, '');
    const url = `${base}/notifications/stream?id_token=${encodeURIComponent(token)}`;

    try {
      this.eventSource = new EventSource(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.eventSource.addEventListener('notification', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as NotificationDto;
        this.handleIncoming(data);
      } catch {
        // payload malformado — ignora
      }
    });

    this.eventSource.onerror = () => {
      this.disconnect();
      this.scheduleReconnect();
    };

    this.eventSource.onopen = () => {
      this.reconnectAttempt = 0;
    };
  }

  private handleIncoming(notification: NotificationDto): void {
    this._items.update((items) => {
      // Dedup por id caso o backend retransmita
      if (items.some((it) => it.id === notification.id)) return items;
      return [notification, ...items].slice(0, 50);
    });
    if (!notification.read) {
      this._unread.update((n) => n + 1);
    }
  }

  private disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Exponential backoff com teto de 30s. Importante em mobile, onde
   * a conexão pode oscilar muito (4G/WiFi handover).
   */
  private scheduleReconnect(): void {
    this.reconnectAttempt = Math.min(this.reconnectAttempt + 1, 6);
    const delay = Math.min(2 ** this.reconnectAttempt * 500, 30_000);
    this.reconnectTimer = setTimeout(() => {
      void this.connectStream();
    }, delay);
  }

  private recalcUnread(): void {
    this._unread.set(this._items().filter((it) => !it.read).length);
  }
}
