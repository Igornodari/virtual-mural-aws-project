import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import {
  Component,
  ViewEncapsulation,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  ElementRef,
  viewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';
import { AppSettings } from 'src/app/app.config';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/shared/types';
import { TranslateModule } from '@ngx-translate/core';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

@Component({
	selector: 'app-clean',
	templateUrl: './clean.component.html',
	styles: `.ambiente-teste {
  position: fixed;
  top: 0; /* ou bottom: 0 */
  left: 0;
  width: 100%;
  background: #f443366b; /* cor de fundo vermelha */
  color: white;
  text-align: center;
  font-weight: bold;
  padding: 8px;
  z-index: 9999;
  pointer-events: none; /* 🔥 não bloqueia cliques */
}

`,
	encapsulation: ViewEncapsulation.None,
	imports: [
		RouterModule,
		CommonModule,
		TranslateModule,
    MuralTopbarComponent,
	],
})
export class CleanComponent implements AfterViewInit, OnDestroy {

	resView = false;
	readonly contentRef = viewChild.required('content', { read: ElementRef });

	//get options from service
	options!: AppSettings;
	private layoutChangesSubscription = Subscription.EMPTY;
	private isMobileScreen = false;
	private htmlElement!: HTMLHtmlElement;

	public user: User;
  authService: any;

	get isOver(): boolean {
		return this.isMobileScreen;
	}

	get isTablet(): boolean {
		return this.resView;
	}

	constructor(
		private settings: CoreService,
		private router: Router,
		private breakpointObserver: BreakpointObserver,
		public auth: AuthService,
		private _cdr: ChangeDetectorRef,
	) {
		this.user = this.auth.currentUser;
		this.htmlElement = document.querySelector('html')!;
		this.options = this.settings.getOptions();
		this.layoutChangesSubscription = this.breakpointObserver
			.observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
			.subscribe(state => {
				// SidenavOpened must be reset true when layout changes
				this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
				this.resView = state.breakpoints[BELOWMONITOR];

				this.options.sidenavCollapsed = false;
				this.settings.setOptions(this.options);
			});

		// Initialize project theme with options
		this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
			this.contentRef().nativeElement.scrollTo({ top: 0 });
		});
	}

	ngAfterViewInit(): void {
		this.settings.notify.subscribe(op => {
			if (op['theme']) {
				this.toggleDarkTheme(op as AppSettings);
			}
		});
		this._cdr.detectChanges();
	}

	ngOnDestroy() {
		this.layoutChangesSubscription.unsubscribe();
	}

	toggleCollapsed() {
		this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
		this.resetCollapsedState();
	}

	resetCollapsedState(timer = 400) {
		setTimeout(() => this.settings.setOptions(this.options), timer);
	}

	onSidenavOpenedChange(isOpened: boolean) {
		this.options.sidenavOpened = isOpened;
		this.settings.setOptions(this.options);
	}

    async onLogout(): Promise<void> {
    await this.authService.logout();
    await this.navigateTo('/login');
  }
  navigateTo(arg0: string) {
    throw new Error('Method not implemented.');
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
