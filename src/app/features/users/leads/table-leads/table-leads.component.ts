import { Component } from '@angular/core';
import BaseTableComponent from 'src/app/components/base-table.component';
import { Lead } from '../lead.type';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { getLeadScoreIcon } from 'src/app/shared/helpers/leadscore.helper';

@Component({
	selector: 'app-table-leads',
	templateUrl: './table-leads.component.html',
	standalone: false
})
export class TableLeadsComponent extends BaseTableComponent<Lead> {
	public formGroup: FormGroup;

	constructor(private _formBuilder: FormBuilder) {
		super({ filterName: 'TableLeadsComponent', version: 'v2' });
		this.filterComponent = TableLeadsComponent;
		this.displayedColumns = [
			'name',
			'email',
			'fone',
			'owner',
			'status',
			'scoreIcon',
			'visibilityIcon',
		];
		this.formGroup = this._formBuilder.nonNullable.group({
			email: [''],
			fullName: [''],
			match: [''],
		});
		this.formGroup.valueChanges.pipe(debounceTime(200)).subscribe(fc => {
			this.searchParams.email = fc.email ? [['like', fc.email]] : '';
			this.searchParams.fullName = fc.fullName ? [['like', fc.fullName]] : '';

			this.getDataSource();
		});
	}

	override beforeApplyQueryRequest(): void {
		this.searchParams['unit.id'] = [['equal', this.unit.id]];
	}

	override setDataSource() {
		return this.requestService.list<Lead>(`${URI_PATH.INTEROP.LEADS}?${this.queryString}`);
	}

	getScoreIcon(score: number): string {
		return getLeadScoreIcon(score);
	}
}
