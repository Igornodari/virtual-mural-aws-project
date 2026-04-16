import {
  Component,
  Input,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { Status } from '../shared/types';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-status',
  imports: [MatChipsModule, TranslateModule, CommonModule],
  templateUrl: './status.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StatusComponent implements OnChanges {
  private translate = inject(TranslateService);

  @Input()
  status!: Status;
  @Input() translationKey?: string;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['status'] || changes['translationKey']) && this.translationKey) {
      this.translate.get(this.translationKey).subscribe((translatedLabel: string) => {
        this.status.label = translatedLabel.toUpperCase();
      });
    }
  }
}
