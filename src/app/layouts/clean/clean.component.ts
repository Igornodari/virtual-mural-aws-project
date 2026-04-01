import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  ViewEncapsulation,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  ElementRef,
  viewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CoreService } from 'src/app/core/services/core.service';
import { AppSettings } from 'src/app/app.config';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/shared/types';
import { TranslateModule } from '@ngx-translate/core';
import { MuralTopbarComponent } from 'src/app/components/mural-topbar/mural-topbar.component';
import { ROUTE_PATHS } from 'src/app/shared/constant/route-paths.constant';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

@Component({
	selector: 'app-clean',
	standalone: true,
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
	private readonly platformId = inject(PLATFORM_ID);
	resView = false;
	readonly contentRef = viewChild.required('content', { read: ElementRef });

	options!: AppSettings;
	private layoutChangesSubscription = Subscription.EMPTY;
	private isMobileScreen = false;
	private htmlElement!: HTMLHtmlElement;

	public user: User;

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
		this.options = this.settings.getOptions();
		if (isPlatformBrowser(this.platformId)) {
			this.htmlElement = document.documentElement as HTMLHtmlElement;
		}
		this.layoutChangesSubscription = this.breakpointObserver
			.observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
			.subscribe(state => {
				this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
				this.resView = state.breakpoints[BELOWMONITOR];

				this.options.sidenavCollapsed = false;
				this.settings.setOptions(this.options);
			});

		// Initialize project theme with options
		this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
			if (isPlatformBrowser(this.platformId)) {
				this.contentRef().nativeElement.scrollTo({ top: 0 });
			}
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
    await this.auth.logout();
    await this.navigateTo(ROUTE_PATHS.login);
  }
	protected async navigateTo(path: string): Promise<void> {
		await this.router.navigateByUrl(path);
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
