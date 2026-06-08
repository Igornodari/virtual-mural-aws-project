import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Versão de cache-busting dos arquivos de i18n.
 *
 * Os JSONs em /assets/i18n NÃO têm hash no nome, então um deploy não invalida
 * o cache do navegador/PWA sozinho (a Vercel servia /assets como `immutable`).
 * Anexar `?v=<versão>` muda a URL a cada bump, forçando o cliente a baixar a
 * versão nova e ignorar qualquer cópia antiga congelada no cache.
 *
 * BUMP este valor sempre que alterar os arquivos de tradução.
 */
const I18N_VERSION = '2026-06-08';

export class AppTranslateLoader implements TranslateLoader {
	constructor(
		private http: HttpClient,
		private config: { prefix?: string; suffix?: string; parts?: string[] }
	) {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getTranslation(lang: string): Observable<any> {
		const prefix = this.config?.prefix ?? '/assets/i18n/';
		const suffix = this.config?.suffix ?? '.json';
		const parts = this.config?.parts ?? ['pt', 'en'];
		
		// Verifica se estamos no lado do servidor para evitar chamadas relativas que falham
		const isServer = typeof window === 'undefined';
		
		if (isServer) {
			return of({}); // Retorna objeto vazio no SSR, o cliente carregará as traduções
		}
		
		const requests = parts.map(part =>
			this.http
				.get(`${prefix}${lang}/${part}${suffix}?v=${I18N_VERSION}`)
				.pipe(catchError(() => of({})))
		);

		return forkJoin(requests).pipe(
			map(translations => translations.reduce((acc, curr) => ({ ...acc, ...curr }), {}))
		);
	}
}
