import { Injectable, signal, computed } from '@angular/core';

/**
 * Serviço global de loading.
 * Controla um contador de requisições HTTP ativas para exibir/ocultar
 * o overlay de loading automaticamente via interceptor.
 *
 * Uso no interceptor:
 *   loadingService.increment();  // antes de enviar a requisição
 *   loadingService.decrement();  // no finalize() do pipe
 *
 * Uso no template:
 *   <app-page-loading [visible]="loadingService.isLoading()" />
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _count = signal(0);

  /** true quando há pelo menos uma requisição HTTP ativa */
  readonly isLoading = computed(() => this._count() > 0);

  increment(): void {
    this._count.update(c => c + 1);
  }

  decrement(): void {
    this._count.update(c => Math.max(0, c - 1));
  }

  /** Força o reset — útil em casos de erro não tratado */
  reset(): void {
    this._count.set(0);
  }
}
