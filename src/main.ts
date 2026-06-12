import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { SentryReporter } from './app/core/reporters/sentry.reporter';
import { environment } from './environments/environments';

// Inicializa Sentry antes do bootstrap para capturar erros de inicialização
SentryReporter.initialize(
  environment.sentryDsn || undefined,
  environment.production ? 'production' : 'development',
);


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
