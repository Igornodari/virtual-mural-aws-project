/**
 * SentryReporter — wrapper singleton em torno do SDK @sentry/angular.
 *
 * Usado pelo GlobalErrorHandler para reportar exceções não tratadas
 * sem acoplamento direto ao SDK. Isso simplifica os testes e garante
 * degradação graciosa quando SENTRY_DSN não está configurado.
 */

type CaptureExceptionFn = (error: unknown) => string;

let captureException: CaptureExceptionFn | null = null;

export const SentryReporter = {
  /**
   * Inicializa o SDK Sentry.
   * Deve ser chamado em main.ts, antes do bootstrapApplication.
   * No-op quando DSN não fornecido.
   */
  initialize(dsn: string | undefined, environment = 'development'): void {
    if (!dsn) {
      console.warn('[Sentry] SENTRY_DSN não configurado — monitoramento desabilitado.');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require('@sentry/angular') as {
        init: (opts: Record<string, unknown>) => void;
        captureException: CaptureExceptionFn;
      };

      Sentry.init({
        dsn,
        environment,
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        integrations: [],
      });

      captureException = (error) => Sentry.captureException(error);
      console.info('[Sentry] SDK inicializado com sucesso.');
    } catch (err) {
      console.warn(
        `[Sentry] Falha ao inicializar SDK: ${(err as Error).message}`,
      );
    }
  },

  /**
   * Envia a exceção ao Sentry.
   * No-op quando não inicializado.
   */
  capture(error: unknown): void {
    captureException?.(error);
  },

  /** Retorna true quando o SDK está ativo. */
  isEnabled(): boolean {
    return captureException !== null;
  },

  /**
   * Reseta o estado interno — usar APENAS em testes.
   * @internal
   */
  _reset(): void {
    captureException = null;
  },
};
