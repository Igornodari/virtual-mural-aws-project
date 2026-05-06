import { Component, OnInit } from '@angular/core';
import { SafeUrlPipe } from '../shared/pipe/safeUrl.pipe';
import BaseComponent from './base.component';
import { importBase } from '../shared/constant/import-base.constant';

@Component({
  selector: 'app-report',
  imports: [SafeUrlPipe, ...importBase],
  templateUrl: './reports.component.html',
})
export class ReportComponent extends BaseComponent implements OnInit {
  reportUrl!: string;
  constructor() {
    super();
  }
  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.reportUrl = data['url'];
    });
  }
}
