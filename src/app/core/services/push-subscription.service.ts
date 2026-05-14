import { Injectable, Signal, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationApiService } from './notification-api.service';

/**
 * Estados possíveis da inscrição de push notifications para o
 * dispositivo atual. Usamos para exibir mensagem correta no painel
 * ("Ativar notificações", "Notificações bloqueadas", etc).
 */
export type PushStatus =
  | 'unsupported' // SW ou Push API ausente
  | 'denied' // usuário bloqueou
  | 'default' // ainda não pediu permissão
  | 'granted-no-subscription' // permissão ok, mas sem subscription
  | 'subscribed'; // tudo certo

/**
 * Gerencia o ciclo de vida da inscrição Web Push:
 *   1. Registra Service Worker (sw-push.js)
 *   2. Pede permissão de notificação ao usuário
 *   3. Gera subscription usando VAPID public key do backend
 *   4. Envia subscription ao backend
 *   5. Permite desinscrição
 *
 * Importante mobile:
 *   - iOS suporta Web Push apenas se o app foi instalado como PWA
 *     (adicionado à tela inicial). O `unsupported` cobre esse caso.
 *   - Android (Chrome/Edge/Firefox) suporta direto.
 *   - Permissão deve ser pedida em resposta a um GESTO DO USUÁRIO
 *     (click do botão). NÃO chamamos automaticamente no startup.
 */
@Injectable({ providedIn: 'root' })
export class PushSubscriptionService {
  private readonly api = inject(NotificationApiService);

  private readonly _status = signal<PushStatus>('default');
  readonly status: Signal<PushStatus> = this._status.asReadonly();

  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Checa o estado inicial — chamado uma vez na inicialização do app
   * (após login). Não pede permissão.
   */
  async detect(): Promise<PushStatus> {
    if (!this.isSupported()) {
      this._status.set('unsupported');
      return 'unsupported';
    }

    const permission = Notification.permission;
    if (permission === 'denied') {
      this._status.set('denied');
      return 'denied';
    }

    if (permission === 'default') {
      this._status.set('default');
      return 'default';
    }

    // permission === 'granted'
    try {
      this.registration = await navigator.serviceWorker.ready;
      const sub = await this.registration.pushManager.getSubscription();
      if (sub) {
        this._status.set('subscribed');
        return 'subscribed';
      }
    } catch {
      // fallback abaixo
    }

    this._status.set('granted-no-subscription');
    return 'granted-no-subscription';
  }

  /**
   * Fluxo completo "Ativar notificações" — usar em resposta a um
   * click do usuário. Lança erro se permissão for negada.
   */
  async subscribe(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Push notifications não suportadas neste dispositivo.');
    }

    // 1. Registra SW (idempotente)
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.register('/sw-push.js');
    }

    // 2. Pede permissão (se ainda não pedida)
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      this._status.set(permission === 'denied' ? 'denied' : 'default');
      throw new Error('Permissão de notificação negada.');
    }

    // 3. Busca VAPID public key
    const { publicKey } = await firstValueFrom(this.api.vapidPublicKey());
    if (!publicKey) {
      throw new Error('Servidor sem VAPID public key configurada.');
    }

    // 4. Gera subscription
    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(publicKey),
    });

    // 5. Envia ao backend
    const json = subscription.toJSON();
    await firstValueFrom(
      this.api.registerPush({
        endpoint: json.endpoint!,
        keys: {
          p256dh: json.keys!['p256dh'],
          auth: json.keys!['auth'],
        },
        userAgent: navigator.userAgent,
      }),
    );

    this._status.set('subscribed');
  }

  async unsubscribe(): Promise<void> {
    if (!this.registration) return;
    const sub = await this.registration.pushManager.getSubscription();
    if (!sub) return;

    await firstValueFrom(this.api.removePush(sub.endpoint)).catch(() => {
      // melhor esforço — mesmo se backend falhar, removemos do device
    });
    await sub.unsubscribe();
    this._status.set('granted-no-subscription');
  }

  private isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * VAPID public key chega como base64url; PushManager precisa de um
   * BufferSource. Retornamos um `ArrayBuffer` (não `Uint8Array`) para
   * evitar o erro do TS 5 onde `Uint8Array<ArrayBufferLike>` aceita
   * `SharedArrayBuffer` — que `PushSubscriptionOptionsInit` recusa.
   */
  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) {
      view[i] = raw.charCodeAt(i);
    }
    return buffer;
  }
}
