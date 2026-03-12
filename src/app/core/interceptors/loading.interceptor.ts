import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor HTTP que controla o estado global de loading.
 * Incrementa o contador ao iniciar uma requisição e decrementa ao finalizar.
 * Requisições para ViaCEP (CEP lookup) são excluídas para não bloquear a UI.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Não exibir loading para requisições de CEP (feedback inline já existe)
  const skipLoading = req.url.includes('viacep.com.br');
  if (skipLoading) return next(req);

  const loadingService = inject(LoadingService);
  loadingService.increment();

  return next(req).pipe(
    finalize(() => loadingService.decrement()),
  );
};
