import { Component } from '@angular/core';
import { AppSettings } from 'src/app/app.config';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';

@Component({
    selector: 'app-blank',
    templateUrl: './blank.component.html',
    styleUrls: [],
    imports: [
        MatSidenavContainer,
        NgClass,
        RouterOutlet,
    ]
})
export class BlankComponent {
  private htmlElement!: HTMLHtmlElement;

  options!: AppSettings;

  constructor (private settings: CoreService) {
    this.htmlElement = document.querySelector('html')!;
    this.options = this.settings.getOptions();
     // Initialize project theme with options
     this.receiveOptions(this.options);
  }

  receiveOptions(options: AppSettings): void {
    this.options = options;
    this.toggleDarkTheme(options);
  }

  toggleDarkTheme(options: AppSettings) {
    if (options.theme === 'dark') {
      this.htmlElement.classList.add('dark-theme');
      this.htmlElement.classList.remove('light-theme');
    } else {
      this.htmlElement.classList.remove('dark-theme');
      this.htmlElement.classList.add('light-theme');
    }
  }
}
