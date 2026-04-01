import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import { NgOptimizedImage } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppNavItemComponent } from './nav-item/nav-item.component';
import { navItems } from './menu/sidebar-data';
import { TranslateModule } from '@ngx-translate/core';
import { CanPipe } from '../../../shared/pipe/can.pipe';
import { MaterialModule } from 'src/material.module';
import { environment } from 'src/environments/environments';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	standalone: true,
	imports: [
    MaterialModule,
    AppNavItemComponent,
    TranslateModule,
    CanPipe
],
})
export class SidebarComponent implements OnInit {
	@Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();
	navItems = navItems;
	projectVersion: string = environment.version;
	selectedItem: string | null = null;

	constructor() {}

	trackByFn(index: number, item: any): any {
		return item.route;
	}
	selectItem(itemRoute: string) {
		if (this.selectedItem !== itemRoute) {
			this.selectedItem = itemRoute;
		}
	}
	ngOnInit(): void {}

	toggle() {
		this.notify.emit();
	}
}
