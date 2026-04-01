import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil, finalize } from 'rxjs';
import BaseComponent from 'src/app/components/base.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { labeGridAdminsMap } from 'src/app/shared/helpers/iconMap.helper';
import { Admin } from 'src/app/shared/types';
import { UpsertAdminComponent } from '../upsert-admin/upsert-admin.component';
import { CanPipe } from '../../../../shared/pipe/can.pipe';
import { PERMISSIONS } from '../../../../shared/constant/permissions.constant';
import { departmentStyles } from '../admin.const';
import { FilterService } from 'src/app/services/filter.service';
import { QueryBuilderComponent } from 'src/app/components/query-builder/query-builder.component';

@Component({
	selector: 'app-card-grid-admin',
	imports: [...importBase, CanPipe],
	templateUrl: './card-grid-admin.component.html',
	styleUrl: './card-grid-admin.component.scss',
})
export class CardGridAdminComponent extends BaseComponent implements OnInit {
	public admins: Admin[] = [];
	public departments: string[] = [];
	public photosUrl: string[] = [];
	public readonly PERMISSIONS = PERMISSIONS;
	public departmentStyles = departmentStyles;
	private labelMap = labeGridAdminsMap;
	page = 1;
	pageSize = 50;
	hasMore = false;
	fields: any[] = [];
	filteredCount: number | null = null;

	constructor(
		private _router: Router,
		private _dialog: MatDialog,
		public filterService: FilterService
	) {
		super();
		this.fields = [
			{ key: 'fullName', label: 'NAME', type: 'text' },
			{ key: 'email', label: 'E-mail', type: 'text' },
			{ key: 'department', label: 'Departamento', type: 'text' },
			{ key: 'isActive', label: 'Ativo', type: 'boolean' },
		];
		this.searchParams = this.filterService.get('CardGridAdminComponent').search;
	}

	ngOnInit(): void {
		this.authService.$unit.pipe(takeUntil(this.unsubscribe$)).subscribe(async unit => {
			this.unit = unit;
			this.page = 1;
			this.searchParams['unit.id'] = [['equal', this.unit?.id]];
			await this.loadEmployees();
		});
	}

	async loadEmployees(): Promise<void> {
		this.loading = true;

		// Obtém os filtros salvos no serviço
		this.queryString.set('search', JSON.stringify(this.searchParams));
		this.queryString.set('page', this.page.toString());
		this.queryString.set('version', 'v2');

		this.requestService
			.list<Admin>(`${URI_PATH.CORE.ADMIN}?${this.queryString}`)
			.pipe(finalize(() => (this.loading = false)))
			.subscribe(response => {
				this.hasMore = response.paginate.total > this.admins.length + response.data.length;
				this.admins = [...response.data];
			});
	}

	loadMore(): void {
		if (this.hasMore && !this.loading) {
			this.page++;
			this.loadEmployees();
		}
	}
	openDialogFilter() {
		this._dialog
			.open(QueryBuilderComponent, {
				width: '700px',
				maxWidth: '95vw',
				data: { name: 'CardGridAdminComponent', fields: this.fields },
			})
			.afterClosed()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe({
				next: async (data: any) => {
					if (data) {
						this.filterService.update('CardGridAdminComponent', {
							name: 'page',
							value: 0,
						});
						this.searchParams = { ...this.searchParams, ...data };
						this.filteredCount = this.filterService.filteredCount('CardGridAdminComponent');
						await this.loadEmployees();
					}
				},
			});
	}

	getCorrectLabel(departmentKey: string): string {
		return this.labelMap[departmentKey];
	}

	openDialog(admin?: Admin): void {
		const dialogRef = this._dialog.open(UpsertAdminComponent, { data: admin });
		dialogRef.afterClosed().subscribe(result => {
			if (result) this.loadEmployees();
		});
	}

	onViewEmployee(admin: Admin): void {
		this._router.navigate(['/users/admin/show/', admin.id]);
	}

	onEditEmployee(admin: Admin): void {
		this.openDialog(admin);
	}
}
