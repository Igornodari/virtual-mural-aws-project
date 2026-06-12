/* eslint-disable */
/**
 * Service Worker dedicado a Web Push.
 *
 * Servido a partir de /sw-push.js — escopo = / (raiz). Independente do
 * Angular service worker (ngsw); pode coexistir sem conflito porque
 * o ngsw normalmente é servido como /ngsw-worker.js.
 *
 * Responsabilidades:
 *  - Recebe eventos `push` enviados pelo backend (Web Push protocol).
 *  - Exibe notificação nativa (com vibração / ícone / título traduzido).
 *  - Quando o usuário clica, abre/foca a tab do app na `actionUrl`.
 *
 * IMPORTANTE: O SW NÃO tem acesso ao ngx-translate. Ele carrega o
 * dicionário direto dos arquivos JSON usando fetch + cache. Mantemos
 * um fallback em PT-BR caso o cache esteja frio.
 */

const CACHE_NAME = 'vm-i18n-cache-v1';
const FALLBACK_LANG = 'pt';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  event.waitUntil(handlePush(event));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(focusOrOpen(event.notification.data?.actionUrl || '/'));
});

async function handlePush(event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // payload malformado — exibe genérica
  }

  const { type, severity, vars, actionUrl, notificationId } = payload;
  const lang = await getPreferredLang();
  const dict = await loadDictionary(lang);

  const titleKey = `NOTIFICATIONS.TYPES.${type}.TITLE`;
  const messageKey = `NOTIFICATIONS.TYPES.${type}.MESSAGE`;

  const title = interpolate(get(dict, titleKey) || 'Virtual Mural', vars || {});
  const body = interpolate(
    get(dict, messageKey) || 'Você tem uma nova notificação.',
    vars || {},
  );

  const options = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    // Vibração com mais ênfase para warning/error — mais útil em mobile.
    vibrate:
      severity === 'error'
        ? [200, 100, 200, 100, 200]
        : severity === 'warning'
        ? [100, 50, 100]
        : [80],
    tag: notificationId || `vm-${type}`,
    renotify: true,
    data: {
      actionUrl: actionUrl || '/',
      notificationId,
      type,
    },
  };

  await self.registration.showNotification(title, options);
}

async function focusOrOpen(url) {
  const allClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  // Se já houver uma janela do app, foca nela e navega.
  for (const client of allClients) {
    if ('navigate' in client) {
      try {
        await client.focus();
        await client.navigate(url);
        return;
      } catch {
        // alguns user agents recusam navigate cross-origin
      }
    }
  }

  // Caso contrário, abre nova janela.
  if (self.clients.openWindow) {
    await self.clients.openWindow(url);
  }
}

async function getPreferredLang() {
  // Sem acesso a localStorage, lemos o cookie/lang setado pelo app —
  // como fallback usamos `pt`. App pode setar um header customizado
  // no fetch mas isso é over-engineering para o caso atual.
  try {
    const clients = await self.clients.matchAll();
    if (clients.length) {
      const c = clients[0];
      const u = new URL(c.url);
      const m = u.searchParams.get('lang') || u.pathname.split('/')[1];
      if (m === 'en' || m === 'pt') return m;
    }
  } catch {}
  return FALLBACK_LANG;
}

async function loadDictionary(lang) {
  const url = `/assets/i18n/${lang}/notifications.json`;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) {
      // Atualiza em background para próximas notificações
      fetch(url).then((res) => res.ok && cache.put(url, res.clone())).catch(() => {});
      return cached.json();
    }
    const fresh = await fetch(url);
    if (fresh.ok) {
      cache.put(url, fresh.clone());
      return fresh.json();
    }
  } catch {}
  return {};
}

function get(obj, path) {
  return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

function interpolate(template, vars) {
  if (!template) return '';
  return String(template).replace(/{{\s*(\w+)\s*}}/g, (_, k) =>
    vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : '',
  );
}
