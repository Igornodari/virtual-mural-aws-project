import {
	Component,
	HostBinding,
	Input,
	OnInit,
	OnChanges,
	Output,
	EventEmitter,
	ChangeDetectorRef,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CanPipe } from 'src/app/shared/pipe/can.pipe';
import { MaterialModule } from 'src/material.module';

@Component({
    selector: 'app-nav-item',
    templateUrl: './nav-item.component.html',
    styleUrls: [],
    animations: [
        trigger('indicatorRotate', [
            state('collapsed', style({ transform: 'rotate(0deg)' })),
            state('expanded', style({ transform: 'rotate(180deg)' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
        ]),
    ],
    imports: [TranslateModule, MaterialModule, CommonModule, CanPipe]
})
export class AppNavItemComponent {
	@Output() toggleMobileLink: any = new EventEmitter<void>();
	@Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();

	expanded: boolean = false;
	disabled: any = false;
	twoLines: any = false;
	@HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
	@Input() item: NavItem | any;
	@Input() depth: any;
	@Output() select: EventEmitter<string> = new EventEmitter<string>();
	@Input() selectedItem: string | undefined | null = null;

	constructor(
		public navService: NavService,
		public router: Router,
		private cdRef: ChangeDetectorRef
	) {
		if (this.depth === undefined) {
			this.depth = 0;
		}
	}

	onItemSelected(item: NavItem) {
		this.selectedItem = item.route;
		if (item.children && item.children.length) {
			this.expanded = !this.expanded;
			this.cdRef.detectChanges();
		} else {
			this.router.navigate([item.route]);
		}
		this.select.emit(item.route);
		window.scroll({ top: 0, left: 0, behavior: 'smooth' });
		if (!this.expanded && window.innerWidth < 1024) {
			this.notify.emit();
		}
	}

	onSubItemSelected(item: NavItem) {
		if (!item.children || !item.children.length) {
			if (this.expanded && window.innerWidth < 1024) {
				this.notify.emit();
			}
		}
	}
}
