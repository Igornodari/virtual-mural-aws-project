import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root',
})
export class SnackBarService {
	constructor(private readonly snackBar: MatSnackBar) {}

	error(message: string): void {
		this.snackBar.open(message, 'Fechar', { duration: 4000, panelClass: ['snackbar-error'] });
	}

	success(message: string): void {
		this.snackBar.open(message, 'Fechar', { duration: 3000, panelClass: ['snackbar-success'] });
	}
}
