import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'pt' | 'en';

const STORAGE_KEY = 'LANGUAGE';

/**
 * Gerencia o idioma da aplicação.
 * Persiste a preferência no localStorage e delega a troca ao TranslateService.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly language = signal<AppLanguage>(this.loadFromStorage());

  setLanguage(lang: AppLanguage): void {
    this.language.set(lang);
    this.translate.use(lang);
    this.persist(lang);
  }

  toggle(): void {
    const next: AppLanguage = this.language() === 'pt' ? 'en' : 'pt';
    this.setLanguage(next);
  }

  get currentLabel(): string {
    return this.language() === 'pt' ? 'PT' : 'EN';
  }

  private persist(lang: AppLanguage): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch {
      // Ignorar
    }
  }

  private loadFromStorage(): AppLanguage {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'pt' || stored === 'en') return stored;
      }
    } catch {
      // Ignorar
    }
    return 'pt';
  }
}
