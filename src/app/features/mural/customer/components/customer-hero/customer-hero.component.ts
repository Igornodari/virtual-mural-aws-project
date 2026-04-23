import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-customer-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './customer-hero.component.html',
  styleUrls: ['./customer-hero.component.scss'],
})
export class CustomerHeroComponent {
  @Input() condoCity = 'Nao definido';
  @Input() totalServices = 0;
  @Input() uniqueProviders = 0;
}
