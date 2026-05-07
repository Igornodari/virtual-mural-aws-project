import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Renderização no cliente: o APP_INITIALIZER bloqueia o bootstrap até as
  // traduções (ngx-translate) terminarem de carregar, eliminando o "flash"
  // de chaves cruas (ex.: AUTH.LOGIN.BADGE) que apareciam no Prerender por
  // causa do AppTranslateLoader retornar {} no server.
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
