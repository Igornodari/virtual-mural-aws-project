import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import BaseComponent from 'src/app/components/base.component';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { Lead } from '../lead.type';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { ActivityComponent } from '../../../../components/historie-activity/activity.component';

@Component({
    selector: 'app-detail-leads',
    templateUrl: './detail-leads.component.html',
    imports: [importBase, ActivityComponent],
    styleUrl: './detail-leads.component.scss'
})
export class DetailLeadsComponent extends BaseComponent {
	public id: string;
	public lead$: Observable<Lead>;
	public matchings: Array<any> = [];
	public matchingTypology = {
		percentCompatible: 0,
		statusStyle: { label: '', style: 'primary' },
		total: 0,
	};
	public totalPoints = 34;

	constructor(private activatedRouter: ActivatedRoute) {
		super();

		this.activatedRouter.paramMap.subscribe(async todo => {
			this.loading = true;
			this.id = todo.get('id') as string;

			this.getMatching();
			await this.loadLeadDetails(this.id);
		});
	}

	async loadLeadDetails(financialId: string): Promise<void> {
		this.lead$ = this.requestService.show<Lead>(URI_PATH.INTEROP.LEADS, financialId).pipe(
			map(lead => {
				this.matchingTypology = {
					percentCompatible: 0,
					statusStyle: { label: '', style: 'primary' },
					total: 0,
				};
				return lead;
			}),
			tap(() => (this.loading = false))
		);
	}

	getMatching() {
		this.requestService
			.show<Array<any>>(URI_PATH.INTEROP.HOUSING_OPTIONS.MATCHING_LEAD, this.id)
			.pipe(
				map(data =>
					data.map(item => {
						item.percent = 100 - (Math.abs(item.total - this.totalPoints) / this.totalPoints) * 100;
						item.statusStyle = this.getCompatibleStyle(item.percent);

						this.matchingTypology.total = this.matchingTypology.total + item.percent;

						item.percent = item.percent.toFixed(2);

						return item;
					})
				)
			)
			.subscribe(matchings => {
				if (matchings.length) {
					this.matchingTypology.percentCompatible = this.matchingTypology.total / matchings.length;

					this.matchingTypology.statusStyle = this.getCompatibleStyle(
						this.matchingTypology.percentCompatible
					);

					this.matchings = matchings;
				}
			});
	}

	getCompatibleStyle(percent: number) {
		const statusStyle = { label: 'Excelente', style: 'primary' };
		if (percent < 40) {
			statusStyle.label = 'Incompatível';
			statusStyle.style = 'error';
		} else if (percent >= 40 && percent < 80) {
			statusStyle.label = 'Compativel';
			statusStyle.style = 'success';
		}
		return statusStyle;
	}
}
