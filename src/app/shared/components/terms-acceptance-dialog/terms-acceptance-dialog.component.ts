import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTE_PATHS } from '../../constant/route-paths.constant';

export type TermsAcceptanceResult = 'accepted' | 'declined';

/**
 * Modal exibido para usuarios que ainda nao aceitaram os Termos de Uso
 * e a Politica de Privacidade (termsAcceptedAt === null).
 * Bloqueia a navegacao ate o usuario aceitar ou sair.
 */
@Component({
  selector: 'app-terms-acceptance-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, RouterLink, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'TERMS_MODAL.TITLE' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'TERMS_MODAL.MESSAGE' | translate }}</p>
      <p style="margin-top: 12px; font-size: 0.875rem;">
        <a [routerLink]="termosPath" target="_blank" rel="noopener"
           style="color: var(--mat-sys-primary); text-decoration: underline;">
          Termos de Uso
        </a>
        &nbsp;·&nbsp;
        <a [routerLink]="privacidadePath" target="_blank" rel="noopener"
           style="color: var(--mat-sys-primary); text-decoration: underline;">
          Política de Privacidade
        </a>
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="decline()">
        {{ 'TERMS_MODAL.DECLINE' | translate }}
      </button>
      <button mat-raised-button color="primary" (click)="accept()">
        {{ 'TERMS_MODAL.ACCEPT' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content p { margin: 0; }
  `],
})
export class TermsAcceptanceDialogComponent {
  private readonly dialogRef =
    inject(MatDialogRef<TermsAcceptanceDialogComponent>);

  readonly termosPath = ROUTE_PATHS.termos;
  readonly privacidadePath = ROUTE_PATHS.privacidade;

  accept(): void {
    this.dialogRef.close('accepted' satisfies TermsAcceptanceResult);
  }

  decline(): void {
    this.dialogRef.close('declined' satisfies TermsAcceptanceResult);
  }
}
