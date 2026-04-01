import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import BaseTableComponent from 'src/app/components/base-table.component';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { Client } from '../clients.type';
import { getLeadScoreIcon } from 'src/app/shared/helpers/leadscore.helper';
import { map, takeUntil } from 'rxjs';
import { importBase } from 'src/app/shared/constant/import-base.constant';

@Component({
	selector: 'app-table-clients',
	templateUrl: './table-clients.component.html',
	standalone: false,
})
export class TableClientsComponent extends BaseTableComponent<Client> {
	public formGroup!: FormGroup;
	constructor() {
		super({
			filterName: 'TableClientsComponent',
			relations: { admin: true },
			version: 'v2',
		});
		this.columnsToDisplay = [
			{ key: 'createdAt', label: 'Criado', options: { show: false } },
			{ key: 'fullName', label: 'NAME' },
			{ key: 'email', label: 'E-mail' },
			{ key: 'cellphone', label: 'PHONE' },
			{ key: 'cpf', label: 'CPF', options: { show: false } },
			{ key: 'admin', label: 'Proprietário', options: { show: false } },
			{ key: 'score', label: 'Score', options: { show: true } },
			{ key: 'visibilityIcon', label: 'Ações' },
		];
		this.fields = [
			{ key: 'fullName', label: 'NAME', type: 'text' },
			{ key: 'email', label: 'E-mail', type: 'text' },
			{ key: 'cpf', label: 'CPF', type: 'text' },
			{ key: 'nationality', label: 'NATIONALITYo', type: 'text' },
		];
	}

	override setDataSource() {
		return this.requestService.list<Client>(`${URI_PATH.CORE.CLIENTS}?${this.queryString}`).pipe(
			takeUntil(this.unsubscribe$),
			map(data => {
				data.data = data.data.map(item => {
					item.scoreIcon = this.getScoreIcon(item.score);
					return item;
				});
				return data;
			})
		);
	}

	getScoreIcon(score: number): string {
		return getLeadScoreIcon(score);
	}
}
