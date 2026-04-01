
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
    selector: 'app-breadcrumb',
    imports: [RouterModule, MatIconModule, TranslateModule],
    templateUrl: './breadcrumb.component.html',
    styleUrls: []
})
export class AppBreadcrumbComponent {
	pageInfo: Data | any = Object.create(null);

	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private titleService: Title,
		private translate: TranslateService
	) {
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.pipe(map(() => this.activatedRoute))
			.pipe(
				map(route => {
					while (route.firstChild) {
						route = route.firstChild;
					}
					return route;
				})
			)
			.pipe(filter(route => route.outlet === 'primary'))
			.pipe(mergeMap(route => route.data))
			.subscribe(event => {
				const titleKey = event?.['title'];
				if (titleKey) {
					this.translate.get(titleKey).subscribe((translatedTitle: string) => {
						this.titleService.setTitle(translatedTitle);
					});
				}

				this.pageInfo = event;
			});
	}
}
