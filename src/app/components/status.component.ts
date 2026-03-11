import {
	Component,
	Input,
	ViewEncapsulation,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { Status } from '../shared/types';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-status',
	imports: [MatChipsModule, TranslateModule, CommonModule],
	template: `
		@if (status) {
		<mat-chip selected [ngClass]="['bg-light-' + status.style]">
			<span [class]="' f-s-14 f-w-600 text-' + status.style">
				{{ status.label | translate }}
			</span>
		</mat-chip>
		}
	`,
	encapsulation: ViewEncapsulation.None,
})
export class StatusComponent implements OnChanges {
	@Input()
  status!: Status;
	@Input() translationKey?: string;

	constructor(private translate: TranslateService) {}

	ngOnChanges(changes: SimpleChanges) {
		if ((changes['status'] || changes['translationKey']) && this.translationKey) {
			this.translate.get(this.translationKey).subscribe((translatedLabel: string) => {
				this.status.label = translatedLabel.toUpperCase();
			});
		}
	}
}
