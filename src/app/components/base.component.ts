import { Component, Inject, NgZone, OnDestroy, Optional, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Condominium, Unit, User } from '../shared/types';
import { AuthService } from '../core/services/auth.service';
import { Location } from '@angular/common';
import { RequestService } from '../core/services/request.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	standalone: true,
	selector: 'app-base',
	template: '',
})
export default class BaseComponent implements OnDestroy {
	private _unsubscribe$ = new Subject<void>();
	private _authService = inject(AuthService);
	private _requestService = inject(RequestService);
	private _location = inject(Location);
	private _router = inject(Router);
	private _ngZone = inject(NgZone);
	public _translate = inject(TranslateService, { optional: true });

	public queryString = new URLSearchParams();
	public searchParams: any = {};
	public loading = false;
	public user: User | null = null;
	public condominium: Condominium | null = null;

	constructor(
		@Optional() @Inject('settings') protected settings?: { loadUnit?: boolean; service?: any }
	) {
		this._authService.$user
			.pipe(takeUntil(this._unsubscribe$))
			.subscribe((user: User | null) => (this.user = user));
		this.loadCondominium();
	}

	afterLoadCondominium(fun: (condominium: Condominium | null) => any) {
		this._authService.$condominium.pipe(takeUntil(this._unsubscribe$)).subscribe((condominium: Condominium | null) => {
			this.condominium = condominium;
			fun(condominium);
		});
	}
	loadCondominium() {
		if (this.settings?.loadUnit === undefined || this.settings?.loadUnit === true) {
			this.afterLoadCondominium(() => {});
		}
	}

	// Compatibilidade temporária com código legado.
	afterLoadUnit(fun: (unit: Unit | null) => any) {
		this.afterLoadCondominium((condominium: Condominium | null) => fun(condominium));
	}

	// Compatibilidade temporária com código legado.
	loadUnit() {
		this.loadCondominium();
	}

	get authService() {
		return this._authService;
	}

	get requestService() {
		return this._requestService;
	}

	get location() {
		return this._location;
	}

	protected async navigateTo(path: string): Promise<void> {
		await this._router.navigateByUrl(path);
	}

	protected setLoadingState(value: boolean): void {
		this._ngZone.run(() => {
			this.loading = value;
		});
	}

	protected updateViewState(update: () => void): void {
		setTimeout(() => {
			this._ngZone.run(update);
		});
	}

	get unsubscribe$() {
		return this._unsubscribe$;
	}

	ngOnDestroy() {
		if (this.settings?.service) {
			this.settings.service = undefined;
		}
		this._unsubscribe$.next();
		this._unsubscribe$.complete();
	}
}
