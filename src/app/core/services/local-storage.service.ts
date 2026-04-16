import { ErrorHandler, Injectable, inject } from '@angular/core';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private cryptoService = inject(CryptoService);
  private readonly errorHandler = inject(ErrorHandler);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  setItem(key: string, value: string): void {
    this.cryptoService.encrypt(value).subscribe({
      next: (encryptedValue) => localStorage.setItem(key, encryptedValue),
      error: (err) => this.errorHandler.handleError(err),
    });
  }

  getItem(key: string): string | null {
    const encryptedValue = localStorage.getItem(key);
    if (encryptedValue) {
      return this.cryptoService.decrypt(encryptedValue);
    } else {
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
