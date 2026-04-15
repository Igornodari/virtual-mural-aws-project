import { ErrorHandler, Injectable } from '@angular/core';
import { CryptoService } from './crypto.service';

@Injectable({
	providedIn: 'root',
})
export class LocalStorageService {
	constructor(private cryptoService: CryptoService, private readonly errorHandler: ErrorHandler) {}

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
