import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { AppSettings } from 'src/app/app.config';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';

@Component({
    selector: 'app-blank',
    standalone: true,
    templateUrl: './blank.component.html',
    styleUrls: [],
    imports: [
        MatSidenavContainer,
        NgClass,
        RouterOutlet,
    ]
})
export class BlankComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private htmlElement!: HTMLHtmlElement;

  options!: AppSettings;

  constructor (private settings: CoreService) {
    this.options = this.settings.getOptions();
    if (isPlatformBrowser(this.platformId)) {
      this.htmlElement = document.documentElement as HTMLHtmlElement;
      this.receiveOptions(this.options);
    }
  }

  receiveOptions(options: AppSettings): void {
    this.options = options;
    this.toggleDarkTheme(options);
  }

  toggleDarkTheme(options: AppSettings) {
    if (!this.htmlElement) {
      return;
    }

    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
    }
  }
}
