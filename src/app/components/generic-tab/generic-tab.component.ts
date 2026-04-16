import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { importBase } from '../../shared/constant/import-base.constant';

@Component({
    selector: 'app-generic-tab',
    imports: [...importBase],
    templateUrl: './generic-tab.component.html',})
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
