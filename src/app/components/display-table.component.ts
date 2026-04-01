import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ColumnDisplay } from './base-table.component';

@Component({
	selector: 'app-display-table',
	imports: [MatIconModule, MatMenuModule, MatCheckboxModule, MatTooltipModule, TranslateModule],

	template: `
		<mat-icon class="display-button" matTooltip="Exibir colunas" [matMenuTriggerFor]="menu"
			>view_week</mat-icon
		>
		<mat-menu #menu="matMenu">
			@for (columns of data; track columns; let i = $index) {
			<button (click)="$event.stopPropagation()" mat-menu-item>
				<mat-checkbox
					[disabled]="columns.options?.type == 'icon-button'"
					(click)="modifyColumns(i)"
					[checked]="columns.options?.show !== false"
					>{{ columns.label | translate }}</mat-checkbox
				>
			</button>
			}
		</mat-menu>
	`,
	encapsulation: ViewEncapsulation.None,
})
export class DisplayTableComponent {
	@Input() data!: ColumnDisplay[];
	@Output() onChangeValue = new EventEmitter<number>();
	modifyColumns(index: number) {
		this.onChangeValue.emit(index);
	}
}
