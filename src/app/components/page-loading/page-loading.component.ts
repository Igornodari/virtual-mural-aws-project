import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Overlay de loading de tela cheia.
 * Utilizado durante transições de rota, autenticação e carregamento inicial.
 *
 * @example
 * <app-page-loading [visible]="isLoading" message="APP.LOADING.AUTHENTICATING" />
 */
@Component({
  selector: 'app-page-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, TranslateModule],
  templateUrl: './page-loading.component.html',
  styleUrls: ['./page-loading.component.scss'],
})
export class PageLoadingComponent {
  @Input() visible = true;
  @Input() message = 'APP.LOADING.DEFAULT';
}
