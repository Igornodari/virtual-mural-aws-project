import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

@Component({
  standalone: true,
  selector: 'app-record-reading',
  imports: [TranslateModule, MaterialModule, CommonModule],
  templateUrl: './record-reading.component.html',
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
