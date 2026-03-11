import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { SnackBarService } from '../core/services/snack-bar.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector, private ngZone: NgZone) {}

  handleError(error: any): void {
    if (error?.message?.includes('ChunkLoadError')) {
      console.warn('ChunkLoadError detectado. Recarregando a página...');
      window.location.reload();
      return;
    }

    const snackBar = this.injector.get(SnackBarService);
    
    // Tratamento para Promise rejections não tratadas (ex: auth)
    const message = error?.rejection?.message || error?.message || 'Ocorreu um erro inesperado.';
    
    this.ngZone.run(() => {
      snackBar.error(message);
    });

    // Evitar console.error explícito em produção para não expor detalhes
    // Opcional: Enviar para um serviço de telemetria como Sentry
    // console.error('Erro global capturado:', error);
  }
}
