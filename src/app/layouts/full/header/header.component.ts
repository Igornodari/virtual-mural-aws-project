import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  Inject,
  DOCUMENT,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { Unit, User } from 'src/app/shared/types';
import { profiledd } from './header.data';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environments';
import { MaterialModule } from 'src/material.module';
import { LanguageComponent } from './language.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';


@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    ...importBase,
    LanguageComponent,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  production: boolean = environment.production;

  @Input() user!: User;
  units: Array<Unit> = [];

  readonly showToggle = input(true);
  readonly toggleChecked = input(false);

  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  public profiledd = profiledd;
  categoryGroup: any[] = [];
  newNotificationsCount: number = 0;
  option: any;

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
    @Inject(CoreService) private settings: CoreService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.option = this.settings.getOptions();
  }

  ngOnInit(): void {
    this.initializeTheme();
  }

  ngOnDestroy(): void {
    // limpar subscriptions aqui se você criar alguma
  }

  initializeTheme(): void {
    if (this.option.theme === 'dark') {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }
  }

  setDark(): void {
    this.option.theme = this.option.theme === 'dark' ? 'light' : 'dark';
    this.settings.setOptions(this.option);

    if (this.option.theme === 'dark') {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }
  }
}
