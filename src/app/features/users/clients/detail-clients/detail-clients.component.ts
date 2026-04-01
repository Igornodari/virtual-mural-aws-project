import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import BaseComponent from 'src/app/components/base.component';
import { Client } from '../clients.type';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { importBase } from 'src/app/shared/constant/import-base.constant';

@Component({
	selector: 'app-detail-clients',
	imports: [importBase],
	templateUrl: './detail-clients.component.html',
	styleUrl: './detail-clients.component.scss',
})
export class DetailClientsComponent extends BaseComponent implements OnInit {
	public client$ = new BehaviorSubject<Client | null>(null);
	public clientId!: string;

	constructor(private route: ActivatedRoute) {
		super();
	}

	async ngOnInit() {
		this.clientId = this.route.snapshot.params['id'];
		this.loading = true;
		await this.loadClientDetails(this.clientId);
		this.loading = false;
	}

	async loadClientDetails(clientId: string): Promise<void> {
		const client = await firstValueFrom(
			this.requestService.show<Client>(URI_PATH.CORE.CLIENTS, clientId)
		);
		this.client$.next(client);
	}
}
