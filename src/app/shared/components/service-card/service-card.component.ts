import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceDto } from 'src/app/core/services/service-api.service';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: ServiceDto;
  @Input() isProvider = false;
  @Input() expanded = false;

  @Output() edit = new EventEmitter<ServiceDto>();
  @Output() remove = new EventEmitter<string>();
  @Output() viewAnalytics = new EventEmitter<ServiceDto>();
  @Output() toggleExpand = new EventEmitter<void>();
  @Output() contact = new EventEmitter<ServiceDto>();
}
