import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import localePtBrExtra from '@angular/common/locales/extra/pt';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AppTranslateLoader } from './shared/helpers/translate-loader.helper';

registerLocaleData(localePtBr, 'pt-BR', localePtBrExtra);

export const HttpLoaderFactory = (http: HttpClient) =>
  new AppTranslateLoader(http, {
    prefix: './assets/i18n/',
    parts: ['common', 'enums', 'header', 'home', 'login', 'sidebar', 'app'],
  });

const provideTranslation = () => ({
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
});

const initializeLanguage = (translate: TranslateService) => () => {
  translate.addLangs(['pt', 'en']);
  translate.setDefaultLang('pt');

  const storedLang =
    typeof window !== 'undefined' ? window.localStorage.getItem('LANGUAGE') : null;
  const browserLang = translate.getBrowserLang();
  const selected = storedLang === 'en' || storedLang === 'pt'
    ? storedLang
    : browserLang === 'en'
      ? 'en'
      : 'pt';

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('LANGUAGE', selected);
  }

  return firstValueFrom(translate.use(selected));
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(TranslateModule.forRoot(provideTranslation())),
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeLanguage,
      deps: [TranslateService],
      multi: true,
    },
  ],
};

export interface AppSettings {
  theme: string;
  sidenavOpened: boolean;
  sidenavCollapsed: boolean;
  boxed: boolean;
  activeTheme: string;
  language: 'pt' | 'en';
  cardBorder: boolean;
  navPos: 'side' | 'top';
}

export const defaults: AppSettings = {
  theme: 'light',
  sidenavOpened: true,
  sidenavCollapsed: false,
  boxed: false,
  cardBorder: false,
  activeTheme: 'orange_theme',
  language: 'pt',
  navPos: 'side',
};
