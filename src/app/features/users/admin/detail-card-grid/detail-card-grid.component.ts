import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Admin } from 'src/app/shared/types';
import { finalize, Observable } from 'rxjs';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import BaseComponent from 'src/app/components/base.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { labeGridAdminsMap } from 'src/app/shared/helpers/iconMap.helper';

@Component({
    selector: 'app-detail-card-grid',
    templateUrl: './detail-card-grid.component.html',
    styleUrls: ['./detail-card-grid.component.scss'],
    imports: [...importBase]
})
export class DetailCardGridComponent extends BaseComponent implements OnInit {
	public admin$: Observable<Admin>;
	private labelMap = labeGridAdminsMap;

	constructor(private route: ActivatedRoute) {
		super();
	}
	ngOnInit(): void {
		const adminId = this.route.snapshot.params['id'];
		this.loadAdminDetails(adminId);
	}

	getCorrectLabel(departmentKey: string): string {
		return this.labelMap[departmentKey];
	}

	public loadAdminDetails(id: string): void {
		this.loading = true;
		this.admin$ = this.requestService
			.get<Admin>(`${URI_PATH.CORE.ADMIN}/${id}`)
			.pipe(finalize(() => (this.loading = false)));
	}
}
