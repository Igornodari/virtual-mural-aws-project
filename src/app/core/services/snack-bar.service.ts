import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private readonly snackBar = inject(MatSnackBar);


  error(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 4000,
      panelClass: 'snackbar-error',
    });
  }

  warning(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 3500,
      panelClass: 'snackbar-warning',
    });
  }

  success(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 3000,
      panelClass: 'snackbar-success',
    });
  }
}
