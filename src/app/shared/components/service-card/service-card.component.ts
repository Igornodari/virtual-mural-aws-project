import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ServiceDto } from 'src/app/core/services/service-api.service';
import { CategoryLabelPipe } from 'src/app/shared/pipes/category-label.pipe';
import { importBase } from '../../constant/import-base.constant';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [
    importBase,
    CategoryLabelPipe
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
