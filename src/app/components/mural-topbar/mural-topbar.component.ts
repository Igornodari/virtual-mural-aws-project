import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';

export type TopbarRole = 'provider' | 'customer';

@Component({
  selector: 'app-mural-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule,
  ],
  templateUrl: './mural-topbar.component.html',
  styleUrls: ['./mural-topbar.component.scss'],
})
export class MuralTopbarComponent {
  @Input({ required: true }) role!: TopbarRole;
  @Input() userName = '';
  @Output() logout = new EventEmitter<void>();
  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
}
