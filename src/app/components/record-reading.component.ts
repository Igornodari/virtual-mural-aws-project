import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

@Component({
  standalone: true,
  selector: 'app-record-reading',
  imports: [TranslateModule, MaterialModule, CommonModule],
  template: `
		<div class="detail-item">
			@if(icon){
			<mat-icon>{{ icon }}</mat-icon>
			}

			<span class="label">{{ label || title | translate }}:</span>
			<ng-content class="value"></ng-content>
		</div>
	`,
  encapsulation: ViewEncapsulation.None,
})
export class RecordReadingComponent {
  @Input()
  title!: string;
  @Input()
  label?: string;
  @Input()
  icon!: string;
}
