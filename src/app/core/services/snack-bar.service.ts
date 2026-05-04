import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private readonly snackBar = inject(MatSnackBar);


  error(message: string): void {
    this.open(message, 'snackbar-error', 4000);
  }

  warning(message: string): void {
    this.open(message, 'snackbar-warning', 3500);
  }

  success(message: string): void {
    this.open(message, 'snackbar-success', 3000);
  }

  private open(message: string, panelClass: string, duration: number): void {
    this.snackBar.open(message, 'Fechar', { duration, panelClass: [panelClass] });
  }
}
