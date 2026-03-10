import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = '$2a$12$z9bd/Qc7Wic8nEjJfD.WwuzCh2EMEtLbTcTAs.j7iof0C1QEH7Vre';
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
    } catch (error) {
      return null;
    }
  }

}
