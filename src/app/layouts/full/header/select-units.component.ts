import { Component, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';

import { AuthService } from 'src/app/services/auth.service';
import { CanPipe } from '../../../shared/pipe/can.pipe';
import { Unit } from 'src/app/shared/types';
import { styleFromData } from '../../../shared/helpers';
import { statusStyles } from '../../../pages/units/units.const';
import { CoreService } from 'src/app/services/core.service';
import { PERMISSIONS } from '../../../shared/constant/permissions.constant';

@Component({
	selector: 'app-select-units',
	template: `@if (unit) {
		<div>
			<button
				mat-button
				[matMenuTriggerFor]="unitmenu"
				aria-label="Unidades"
				[disabled]="!(PERMISSIONS.SELECT_UNIT | can)"
			>
				<div class="d-flex align-items-center">
					<b>{{ unit.name }}</b>
					<mat-icon class=" m-t-10 f-s-20">expand_more</mat-icon>
				</div>
			</button>
			<mat-menu #unitmenu="matMenu" class="cardWithShadow">
				@for (_unit of units; track _unit) {
				<button
					[class]="_unit.id == unit.id ? 'unit-selected' : ''"
					mat-menu-item
					(click)="selectUnit(_unit)"
				>
					<div class="d-flex align-items-center ">
						<span class="mat-subtitle-1 f-s-14">{{ _unit.name }}</span>
					</div>
				</button>
				} @if (PERMISSIONS.SELECT_ALL_UNIT | can) {
				<button
					[class]="'' == unit.id ? 'unit-selected' : ''"
					mat-menu-item
					(click)="
					selectUnit({
						name: 'Todas',
						id: '',
						createdAt: '',
						updatedAt: '',
						hotelCode: 0,
						address: '',
						addressCity: '',
						isActive: true,
						zohoId: '',
						waPhoneNumber: '',
						addressStreet: '',
						opening: '',
						closure: '',
						regulationUrl: '',
						statusStyle: styleFromData(statusStyles, 'Ativa'),
					})
				"
				>
					<div class="d-flex align-items-center ">
						<span class="mat-subtitle-1 f-s-14">Todas</span>
					</div>
				</button>
				}
			</mat-menu>
		</div>
		}`,
	encapsulation: ViewEncapsulation.None,
	imports: [MaterialModule, CanPipe],
})
export class SelectUnitsComponent {
	units: Array<Unit>;
	unit: Unit;
	PERMISSIONS = PERMISSIONS.MENU;
	constructor(public authService: AuthService, private settings: CoreService) {
		this.settings.getUnits().subscribe(units => (this.units = units));
		this.authService.$unit.subscribe(unit => (this.unit = unit));
	}

	selectUnit(unit: Unit) {
		this.authService.setUnit(unit);
	}

	protected readonly styleFromData = styleFromData;
	protected readonly statusStyles = statusStyles;
}
