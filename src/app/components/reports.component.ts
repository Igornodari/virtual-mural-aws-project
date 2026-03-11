import { Component } from '@angular/core';
import { SafeUrlPipe } from '../shared/pipe/safeUrl.pipe';
import BaseComponent from './base.component';
import { importBase } from '../shared/constant/import-base.constant';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-report',
    imports: [SafeUrlPipe, ...importBase],
    template: `<iframe
		[src]="reportUrl | safeUrl"
		width="100%"
		height="800px"
		frameborder="0"
		allowfullscreen
	></iframe>`
})
export class ReportComponent extends BaseComponent {
  reportUrl!: string;

  constructor(private route: ActivatedRoute) {
		super();
	}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.reportUrl = data['url'];
    });
  }

}
