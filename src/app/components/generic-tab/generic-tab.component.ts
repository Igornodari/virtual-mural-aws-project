import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { importBase } from '../../shared/constant/import-base.constant';

@Component({
    selector: 'app-generic-tab',
    imports: [...importBase],
    template: `
		<mat-tab-group (selectedIndexChange)="onTabChange($event)">
		  @for (tab of tabs; track tab) {
		    <mat-tab [label]="tab.label | translate"></mat-tab>
		  }
		</mat-tab-group>
		@if (activeTabContent) {
		  <div>
		    <ng-container *ngTemplateOutlet="activeTabContent"></ng-container>
		  </div>
		}
		`
})
export class GenericTabComponent implements OnInit {
	@Input() tabs: { label: string; content: any }[] = [];
	@Output() selectedIndexChange = new EventEmitter<number>();
	activeTabContent: any;


	onTabChange(index: number): void {
		this.activeTabContent = this.tabs[index]?.content;
		this.selectedIndexChange.emit(index);
	}

	ngOnInit(): void {
		if (this.tabs.length > 0) {
			this.activeTabContent = this.tabs[0].content;
		}
	}
}
