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
import { CoreService } from 'src/app/core/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { AuthService } from 'src/app/core/services/auth.service';
import { Unit, User } from 'src/app/shared/types';
import { profiledd } from './header.data';
import { environment } from 'src/environments/environments';
import { MaterialModule } from 'src/material.module';
import { LanguageComponent } from './language.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MaterialModule,
    RouterModule,
    TranslateModule,
    LanguageComponent,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly fallbackAvatar = '/assets/images/profile/user-1.jpg';
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

  get avatarUrl(): string {
    return this.user?.avatarUrl?.trim() || this.fallbackAvatar;
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;

    if (img.src.endsWith(this.fallbackAvatar)) {
      return;
    }

    img.src = this.fallbackAvatar;
  }
}
