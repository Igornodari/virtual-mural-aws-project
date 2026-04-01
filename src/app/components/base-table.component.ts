import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	Inject,
	OnDestroy,
	ViewChild,
	inject,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
	Observable,
	Subject,
	catchError,
	map,
	merge,
	share,
	startWith,
	switchMap,
	takeUntil,
} from 'rxjs';
import { ListResponse } from '../shared/types';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';

import BaseComponent from './base.component';
import { TranslateService } from '@ngx-translate/core';
import { FilterService } from '../core/services/filter.service';
import { LocalStorageService } from '../core/services/local-storage.service';
import { QBFieldType, QueryBuilderComponent } from './query-builder/query-builder.component';


export type ColumnDisplay = {
	key: string;
	label: string;
	buttons?: [{ click: (...data: any) => any; icon: string; color?: string }];
	options?: {
		type?: 'text' | 'date' | 'currency' | 'status' | 'icon-button' | 'custom';
		sort?: string;
		truncate?: number;
		show?: boolean;
	};
};
class Service<T> {
	setDataSource!: (
    queryString: URLSearchParams,
    unsubscribe$: Subject<void>
  ) => Observable<ListResponse<T>>;
}

@Component({
	standalone: true,
	selector: 'app-base-table',
	template: '',
})
export default class BaseTableComponent<T>
	extends BaseComponent
	implements OnDestroy, AfterViewInit
{
	@ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
	@ViewChild(MatPaginator) paginator: MatPaginator = Object.create(null);
	@ViewChild(MatSort, { static: true }) sort: MatSort = Object.create(null);

	//REQUEST
	protected urlPath!: string;
	private unsubscribeRequest: any;

	//TABLE
	public columnsToDisplay: Array<ColumnDisplay> = [];
	public displayedColumns!: string[];
	public dataSource = new MatTableDataSource([] as T[]);
	public resultsLength: number = 0;
	public pageSizeOptions = [5, 10, 20, 30, 40, 50, 60, 100, 200, 500];

	//filter
	public filterService: FilterService;
	public translate: TranslateService;
	public filteredCount: any;
	protected filterComponent: any;

	public fields!: QBFieldType[];
	protected _dialog: MatDialog;
	protected _cdr: ChangeDetectorRef;

	protected _localStorageService: LocalStorageService;
  unit: any;

	constructor(
		@Inject('settings')
		protected override settings: {
			loadUnit?: boolean;
			filterName: string;
			relations?: Record<any, any>;
			service?: Service<T>;
			version?: 'v1' | 'v2';
		}
	) {
		super(settings);
		this._cdr = inject(ChangeDetectorRef);
		this._dialog = inject(MatDialog);
		this.filterService = inject(FilterService);
		this.translate = inject(TranslateService);
		this._localStorageService = inject(LocalStorageService);

		if (!this.filterComponent) {
			this.filterComponent = QueryBuilderComponent;
		}
	}

	ngAfterViewInit(): void {
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.setDisplayedColumns();

		if (this.settings?.loadUnit === undefined || this.settings?.loadUnit === true) {
			this.afterLoadUnit(unit => {
				this.unit = unit;
				this.getDataSource();
				this._cdr.detectChanges();
			});
		}
		this.afterViewInit();
	}
  afterLoadUnit(arg0: (unit: any) => void) {
    throw new Error('Method not implemented.');
  }

	setDisplayedColumns() {
		const dataPageString = this._localStorageService.getItem(this.settings.filterName);
		if (dataPageString) {
			const dataPage = JSON.parse(dataPageString);
			dataPage.columnsToDisplay.forEach((newCol: any) => {
				const existingCol = this.columnsToDisplay.find(col => col.key === newCol.key);
				if (existingCol) {
					if (newCol.options) {
						existingCol.options = {
							...existingCol.options,
							...newCol.options,
						};
					}
				}
			});
		}

		this.displayedColumns =
			this.displayedColumns ??
			this.columnsToDisplay.reduce((filtered: string[], c) => {
				if (c.options?.show !== false) {
					filtered.push(c.key);
				}
				return filtered;
			}, []);
	}
	afterViewInit() {}

	setFilter() {
		this.searchParams = this.filterService.get(this.settings.filterName).search;
		this.filteredCount = this.filterService.filteredCount(this.settings.filterName);
		this._cdr.detectChanges();
	}

	setDataSource(): Observable<ListResponse<T>> {
		if (this.settings.service) {
			return this.settings.service.setDataSource(this.queryString, this.unsubscribe$);
		} else {
			return this.requestService
				.list<T>(`${this.urlPath}?${this.queryString}`)
				.pipe(takeUntil(this.unsubscribe$));
		}
	}

	setSort() {
		if (this.settings.version == 'v2') {
			return this.defineSortV2();
		} else {
			return this.defineSortV1();
		}
	}

	private defineSortV1() {
		let sortSplit = this.sort.active.split('.');
		let sort: any = {};
		if (sortSplit[1] && !sortSplit[2]) {
			sort = `{"${sortSplit[0]}":{"${sortSplit[1]}":"${this.sort.direction.toUpperCase()}"}}`;
		} else if (sortSplit[2]) {
			sort = `{"${sortSplit[0]}":{"${sortSplit[1]}":{"${
				sortSplit[2]
			}":"${this.sort.direction.toUpperCase()}"}}}`;
		} else {
			sort = `{"${sortSplit[0]}":"${this.sort.direction.toUpperCase()}"}`;
		}

		return sort;
	}
	private defineSortV2() {
		return `{"${this.sort.active}":"${this.sort.direction.toUpperCase()}"}`;
	}

	applyQueryString() {
		this.beforeApplyQueryRequest();

		this.settings.relations
			? this.queryString.set('relations', JSON.stringify(this.settings.relations))
			: false;

		this.queryString.set('search', JSON.stringify(this.searchParams));
		this.queryString.set('page', String(this.paginator.pageIndex + 1));
		this.queryString.set('limit', String(this.paginator.pageSize));
		this.queryString.set('version', String(this.settings.version));
		const sort = this.setSort();
		this.queryString.set('sort', sort);
		this.filterService.set({
			name: this.settings.filterName,
			page: this.paginator.pageIndex,
			pageSize: this.paginator.pageSize,
			sort,
		});
	}

	/**
	 * The function `beforeApplyQueryRequest` sets the `unit` property in `searchParams` to an object with
	 * the `id` property from the `unit` object as default filter.
	 */
	beforeApplyQueryRequest(): void {
		if (this.settings?.version == 'v2') {
			this.searchParams['unit.id'] = [['equal', this.unit.id]];
		} else {
			this.searchParams.unit = { id: this.unit.id };
		}
	}

	getDataSource() {
		this.setFilter();
		this.loading = true;
		const filter = this.filterService.get(this.settings.filterName);

		this.paginator.pageIndex = filter.page ?? 0;
		this.paginator.pageSize = filter.pageSize ?? this.paginator.pageSize;

		this.unsubscribeRequest?.unsubscribe();
		this.unsubscribeRequest = merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				startWith({}),
				takeUntil(this.unsubscribe$),
				switchMap(() => {
					this.loading = true;

					this.applyQueryString();

					return this.setDataSource();
				}),
				share(),
				map(data => {
					this.loading = false;
					this.resultsLength = data.paginate.total || 0;
					return data.data;
				}),
				catchError(err => {
					console.error(err);
					this.loading = false;
					return [];
				})
			)

			.subscribe({
				next: data => (this.dataSource = new MatTableDataSource(data)),
				error: () => (this.loading = false),
			});
	}

	modifyColumns(index: number) {
		const col = this.columnsToDisplay[index];
		const isHidden = col.options?.show === false;
		this.columnsToDisplay[index].options = {
			...col.options,
			show: isHidden,
		};
		this.displayedColumns = this.columnsToDisplay
			.filter(c => c.options?.show !== false)
			.map(c => c.key);
		this._localStorageService.setItem(
			this.settings.filterName,
			JSON.stringify({ columnsToDisplay: this.columnsToDisplay })
		);
		this._cdr.detectChanges();
	}

	openDialogFilter() {
		if (!this.filterComponent) {
			throw new Error('filterComponent not configured');
		}

		this._dialog
			.open(this.filterComponent, {
				width: '700px',
				maxWidth: '95vw',
				data: { name: this.settings.filterName, fields: this.fields },
			})
			.afterClosed()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe({
				next: (data: any) => {
					if (data) {
						this.filterService.update(this.settings.filterName, {
							name: 'page',
							value: 0,
						});
						this.searchParams = { ...this.searchParams, ...data };
						this.filteredCount = this.filterService.filteredCount(this.settings.filterName);
						this.getDataSource();
					}
				},
			});
	}
}
