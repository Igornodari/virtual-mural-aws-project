import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { TopbarActiveMode } from '../mural-topbar/mural-topbar.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatRippleModule, TranslateModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent {
  /** Se o usuário ativou o modo prestador. Habilita o 4o item da nav. */
  @Input({ required: true }) isProvider = false;

  /** Modo ativo, usado apenas para destacar o item correto. */
  @Input({ required: true }) activeMode: TopbarActiveMode = 'customer';

  @Input({ required: true }) customerLink!: string;
  @Input({ required: true }) providerLink!: string;
  @Input({ required: true }) appointmentsLink!: string;
  @Input({ required: true }) profileLink!: string;
}
