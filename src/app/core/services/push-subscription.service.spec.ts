import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PushSubscriptionService } from './push-subscription.service';
import { NotificationApiService } from './notification-api.service';

/**
 * Foco dos testes: o fluxo de inscrição em mobile.
 *  - Aguardar o Service Worker ativar (navigator.serviceWorker.ready)
 *    antes de pushManager.subscribe — evita InvalidStateError no Android.
 *  - Reutilizar subscription existente em vez de recriar.
 *  - Propagar erro (não engolir) quando a permissão é negada.
 */
describe('PushSubscriptionService', () => {
  let service: PushSubscriptionService;
  let api: {
    vapidPublicKey: ReturnType<typeof vi.fn>;
    registerPush: ReturnType<typeof vi.fn>;
    removePush: ReturnType<typeof vi.fn>;
  };
  let registerSpy: ReturnType<typeof vi.fn>;
  let getSubscriptionSpy: ReturnType<typeof vi.fn>;
  let subscribeSpy: ReturnType<typeof vi.fn>;

  const fakeSubscription = {
    endpoint: 'https://push.example/abc',
    toJSON: () => ({
      endpoint: 'https://push.example/abc',
      keys: { p256dh: 'p', auth: 'a' },
    }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    api = {
      vapidPublicKey: vi.fn().mockReturnValue(of({ publicKey: 'AAAA' })),
      registerPush: vi.fn().mockReturnValue(of({})),
      removePush: vi.fn().mockReturnValue(of({})),
    };

    getSubscriptionSpy = vi.fn().mockResolvedValue(null);
    subscribeSpy = vi.fn().mockResolvedValue(fakeSubscription);
    const registration = {
      pushManager: {
        getSubscription: getSubscriptionSpy,
        subscribe: subscribeSpy,
      },
    };
    registerSpy = vi.fn().mockResolvedValue(registration);

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: registerSpy,
        ready: Promise.resolve(registration),
      },
    });
    (window as unknown as { PushManager: unknown }).PushManager = function () {};
    (window as unknown as { Notification: unknown }).Notification = {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    };

    TestBed.configureTestingModule({
      providers: [
        PushSubscriptionService,
        { provide: NotificationApiService, useValue: api },
      ],
    });
    service = TestBed.inject(PushSubscriptionService);
  });

  afterEach(() => {
    delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
    delete (window as unknown as { PushManager?: unknown }).PushManager;
    delete (window as unknown as { Notification?: unknown }).Notification;
    vi.restoreAllMocks();
  });

  it('aguarda o SW ativar e cria subscription quando não existe', async () => {
    await service.subscribe();

    expect(registerSpy).toHaveBeenCalledWith('/sw-push.js');
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(api.registerPush).toHaveBeenCalledTimes(1);
    expect(service.status()).toBe('subscribed');
  });

  it('reutiliza subscription existente sem recriar nem buscar VAPID', async () => {
    getSubscriptionSpy.mockResolvedValue(fakeSubscription);

    await service.subscribe();

    expect(subscribeSpy).not.toHaveBeenCalled();
    expect(api.vapidPublicKey).not.toHaveBeenCalled();
    expect(api.registerPush).toHaveBeenCalledTimes(1);
    expect(service.status()).toBe('subscribed');
  });

  it('propaga erro e marca status "denied" quando a permissão é negada', async () => {
    (window as unknown as { Notification: unknown }).Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('denied'),
    };

    await expect(service.subscribe()).rejects.toThrow();
    expect(service.status()).toBe('denied');
    expect(subscribeSpy).not.toHaveBeenCalled();
  });
});
