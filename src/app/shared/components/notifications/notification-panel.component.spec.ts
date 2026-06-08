import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationPanelComponent } from './notification-panel.component';
import { NotificationCenterService } from 'src/app/core/services/notification-center.service';
import { PushSubscriptionService } from 'src/app/core/services/push-subscription.service';

/**
 * Foco: o banner "Ativar push" não pode engolir erros silenciosamente.
 * Deve expor loading enquanto inscreve e uma mensagem de erro em falha.
 */
describe('NotificationPanelComponent — onEnablePush', () => {
  let component: NotificationPanelComponent;
  let subscribeMock: ReturnType<typeof vi.fn>;

  const centerMock = {
    items: signal([]),
    unread: signal(0),
    loading: signal(false),
    badge: signal(''),
    vars: vi.fn().mockReturnValue({}),
    titleKey: vi.fn().mockReturnValue(''),
    messageKey: vi.fn().mockReturnValue(''),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
    markAsRead: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    subscribeMock = vi.fn().mockResolvedValue(undefined);
    const pushMock = {
      status: signal<'default' | 'subscribed' | 'denied'>('default'),
      subscribe: subscribeMock,
    };

    TestBed.configureTestingModule({
      imports: [NotificationPanelComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NotificationCenterService, useValue: centerMock },
        { provide: PushSubscriptionService, useValue: pushMock },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
      ],
    });

    component = TestBed.createComponent(NotificationPanelComponent).componentInstance;
  });

  it('liga o loading enquanto inscreve e desliga ao concluir com sucesso', async () => {
    let resolve!: () => void;
    subscribeMock.mockReturnValue(new Promise<void>((r) => (resolve = r)));

    const promise = component.onEnablePush(new MouseEvent('click'));
    expect(component.pushLoading()).toBe(true);

    resolve();
    await promise;

    expect(component.pushLoading()).toBe(false);
    expect(component.pushError()).toBeNull();
  });

  it('expõe mensagem de erro (não engole) quando a inscrição falha', async () => {
    subscribeMock.mockRejectedValue(new Error('InvalidStateError'));

    await component.onEnablePush(new MouseEvent('click'));

    expect(component.pushLoading()).toBe(false);
    expect(component.pushError()).not.toBeNull();
  });
});
