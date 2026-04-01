import { BreakpointObserver } from '@angular/cdk/layout';
import {
	Component,
	ViewChild,
	ViewEncapsulation,
	AfterViewInit,
	ChangeDetectorRef,
	OnDestroy,
	ElementRef,
	Inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';
import { AppSettings } from 'src/app/app.config';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppBreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/shared/types';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { navItems } from './sidebar/menu/sidebar-data';
import { MaterialModule } from 'src/material.module';


const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

@Component({
	selector: 'app-full',
	templateUrl: './full.component.html',
	styleUrls: [],
	encapsulation: ViewEncapsulation.None,
	imports: [
		RouterModule,
		MaterialModule,
		CommonModule,
		SidebarComponent,
		HeaderComponent,
		AppBreadcrumbComponent,
		TranslateModule,
	],
})
export class FullComponent implements AfterViewInit, OnDestroy {
	navItems = navItems;

	@ViewChild('leftsidenav')
  public sidenav!: MatSidenav;
	resView = false;
	@ViewChild('content', { static: true, read: ElementRef })
	contentRef!: ElementRef<HTMLElement>;

	//get options from service
	options = this.settings.getOptions();
	private layoutChangesSubscription = Subscription.EMPTY;
	private isMobileScreen = false;
	private isContentWidthFixed = true;
	private isCollapsedWidthFixed = false;
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
		this.auth.refresh();
		this.user = this.auth.currentUser;


		this.htmlElement = document.querySelector('html')!;

		this.layoutChangesSubscription = this.breakpointObserver
			.observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW, BELOWMONITOR])
			.subscribe(state => {
				// SidenavOpened must be reset true when layout changes
				this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
				this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
				this.resView = state.breakpoints[BELOWMONITOR];

				this.options.sidenavCollapsed = false;
				this.settings.setOptions(this.options);
			});

		// Initialize project theme with options
		this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
			this.contentRef.nativeElement.scrollTo({ top: 0 });
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
		this.isContentWidthFixed = false;
		this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
		this.resetCollapsedState();
	}

	resetCollapsedState(timer = 400) {
		setTimeout(() => this.settings.setOptions(this.options), timer);
	}

	onSidenavClosedStart() {
		this.isContentWidthFixed = false;
	}

	onSidenavOpenedChange(isOpened: boolean) {
		this.isCollapsedWidthFixed = !this.isOver;
		this.options.sidenavOpened = isOpened;
		this.settings.setOptions(this.options);
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
