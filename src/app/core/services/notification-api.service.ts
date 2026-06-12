import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from './request.service';

/**
 * Tipos de notificação suportados pelo backend.
 * MANTER sincronizado com `notifications/entities/notification.entity.ts`
 * e com `assets/i18n/{pt,en}/notifications.json`.
 */
export type NotificationType =
  | 'NEW_APPOINTMENT_REQUEST'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_REJECTED'
  | 'CUSTOMER_CANCELLED'
  | 'PROVIDER_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_COMPLETED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_PENDING_PROVIDER'
  | 'RESCHEDULE_REQUESTED'
  | 'RESCHEDULE_ACCEPTED'
  | 'RESCHEDULE_REJECTED'
  | 'NEW_SERVICE_AVAILABLE'
  | 'NEW_REVIEW';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

/**
 * Payload genérico — campos opcionais por tipo. O frontend interpola
 * essas chaves nas strings de tradução (ex.: {{customerName}}).
 */
export interface NotificationPayload {
  appointmentId?: string;
  serviceId?: string;
  serviceName?: string;
  customerId?: string;
  customerName?: string;
  providerId?: string;
  providerName?: string;
  scheduledDate?: string;
  scheduledDay?: string;
  scheduledTime?: string;
  amount?: string;
  currency?: string;
  rating?: number;
  [key: string]: unknown;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  payload: NotificationPayload;
  actionUrl: string | null;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationDto[];
  total: number;
  unread: number;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly request = inject(RequestService);

  list(params: { unread?: boolean; limit?: number; offset?: number } = {}): Observable<NotificationListResponse> {
    return this.request.get<NotificationListResponse>('/notifications', {
      params: {
        unread: params.unread === true ? 'true' : undefined,
        limit: params.limit,
        offset: params.offset,
      },
    });
  }

  unreadCount(): Observable<{ count: number }> {
    return this.request.get<{ count: number }>('/notifications/unread-count');
  }

  markAsRead(id: string): Observable<NotificationDto> {
    return this.request.patchPath<NotificationDto, Record<string, never>>(
      `/notifications/${id}/read`,
      {},
    );
  }

  markAllAsRead(): Observable<{ updated: number }> {
    return this.request.patchPath<{ updated: number }, Record<string, never>>(
      '/notifications/read-all',
      {},
    );
  }

  vapidPublicKey(): Observable<{ publicKey: string }> {
    return this.request.get<{ publicKey: string }>('/notifications/vapid-public-key');
  }

  registerPush(payload: PushSubscriptionPayload): Observable<{ id: string }> {
    return this.request.post<{ id: string }, PushSubscriptionPayload>(
      '/notifications/push-subscription',
      payload,
    );
  }

  removePush(endpoint: string): Observable<{ removed: boolean }> {
    return this.request.deletePath<{ removed: boolean }>(
      `/notifications/push-subscription?endpoint=${encodeURIComponent(endpoint)}`,
    );
  }
}
