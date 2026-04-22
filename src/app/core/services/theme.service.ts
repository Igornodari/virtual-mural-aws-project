import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'APP_THEME';

/**
 * Gerencia o tema da aplicação (light/dark).
 * Aplica a classe `dark-theme` no elemento <html> e persiste a preferência no localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<AppTheme>(this.loadFromStorage());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    const next: AppTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    this.persist(theme);
  }

  get isDark(): boolean {
    return this.theme() === 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
    }
  }

  private persist(theme: AppTheme): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    } catch {
      // Ignorar erro de localStorage
    }
  }

  private loadFromStorage(): AppTheme {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
        if (stored === 'light' || stored === 'dark') return stored;
        // Respeitar preferência do sistema operacional
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      }
    } catch {
      // Ignorar
    }
    return 'light';
  }
}
