import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly secretKey: string;

  constructor() {
    // A chave não deve estar hardcoded. Usando uma chave gerada ou valor fallback seguro
    this.secretKey = typeof window !== 'undefined' && window.localStorage 
      ? (window.localStorage.getItem('APP_SEC_KEY') || this.generateAndStoreKey())
      : 'fallback_secret_key_for_ssr';
  }

  private generateAndStoreKey(): string {
    const newKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    try {
      window.localStorage.setItem('APP_SEC_KEY', newKey);
    } catch (_e) {
      // Ignora erro se localStorage não estiver disponível
    }
    return newKey;
  }

  encrypt(value: string): Observable<string> {
    return new Observable<string>(observer => {
      const encrypted = CryptoJS.AES.encrypt(value, this.secretKey).toString();
      observer.next(encrypted);
      observer.complete();
    });
  }

  decrypt(value: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (_error) {
      return null;
    }
  }

}
