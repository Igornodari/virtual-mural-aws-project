import {
  APP_INITIALIZER,
  ApplicationConfig,
  LOCALE_ID,
  importProvidersFrom,
  ErrorHandler,
} from '@angular/core';

import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import localePtBrExtra from '@angular/common/locales/extra/pt';

import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';

import { ThemeService } from './core/services/theme.service';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';

import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading/loading.interceptor';
import { errorInterceptor } from './core/interceptors/errors/error.interceptor';

import { AppTranslateLoader } from './shared/helpers/translate-loader.helper';
import { responseFeedbackInterceptor } from './core/interceptors/response/response-feedback.interceptor';
import { requestInterceptor } from './core/interceptors/request/request.interceptor';

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

  let storedLang: string | null = null;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      storedLang = window.localStorage.getItem('LANGUAGE');
    }
  } catch (_e) {
    // Ignorar erro se localStorage não estiver disponível
  }

  const browserLang = translate.getBrowserLang();

  const selected =
    storedLang === 'en' || storedLang === 'pt'
      ? storedLang
      : browserLang === 'en'
        ? 'en'
        : 'pt';

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('LANGUAGE', selected);
    }
  } catch (_e) {
    // Ignorar erro se localStorage não estiver disponível
  }

  return firstValueFrom(translate.use(selected));
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        loadingInterceptor,
        requestInterceptor,
        authInterceptor,
        responseFeedbackInterceptor,
        errorInterceptor,
      ]),
    ),

    importProvidersFrom(TranslateModule.forRoot(provideTranslation())),

    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },

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

    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: ThemeService) => () => themeService.theme(),
      deps: [ThemeService],
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
