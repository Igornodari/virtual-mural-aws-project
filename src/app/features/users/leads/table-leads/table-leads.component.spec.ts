import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { getLeadScoreIcon } from 'src/app/shared/helpers/leadscore.helper';
import BaseTableComponent from 'src/app/components/base-table.component';
import { mockAdmin, mockUnit, mockUser } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from 'src/app/services/auth.service';
import { RequestService } from 'src/app/services/request.service';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { TableLeadsComponent } from './table-leads.component';
import { Lead } from '../lead.type';

describe('TableLeadsComponent', () => {
	let component: TableLeadsComponent;
	let fixture: ComponentFixture<TableLeadsComponent>;
	let mockDialog: jasmine.SpyObj<MatDialog>;
	let mockBaseTableComponent: jasmine.SpyObj<BaseTableComponent<Lead>>;
	let mockRequestService: any;


	beforeEach(async () => {
		mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
		mockBaseTableComponent = jasmine.createSpyObj('BaseTableComponent', ['setDataSource', 'getDataSource']);

		class FakeLoader implements TranslateLoader {
			getTranslation(lang: string) {
				return of({});
			}
		}
		const mockAuthService = {
			$unit: of(mockUnit),
			$user: of(mockUser),
			currentUser: {
				...mockUser,
				role: {
					name: 'admin',
					permissions: [{ name: 'admin-access' }],
				},
			},
		};

		mockRequestService = jasmine.createSpyObj(['list']);
		mockRequestService.list.and.returnValue(of({ data: [mockAdmin] }));
		await TestBed.configureTestingModule({
			declarations: [TableLeadsComponent],
			imports: [importBase,
				ReactiveFormsModule,
				BrowserAnimationsModule,
				MatDialogModule,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader },
				}),
			],
			providers: [
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: RequestService, useValue: mockRequestService },
				{ provide: MatDialog, useValue: {} },
				{ provide: MatDialog, useValue: mockDialog },
				{ provide: BaseTableComponent, useValue: mockBaseTableComponent },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(TableLeadsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set displayedColumns correctly', () => {
		expect(component.displayedColumns).toEqual([
			'name', 'email', 'fone', 'owner', 'status', 'scoreIcon', 'visibilityIcon'
		]);
	});

	it('should call setDataSource with the correct URI', () => {
		const expectedUri = `${URI_PATH.CORE.CLIENTS}?${component.queryString}`;
		spyOn(component, 'setDataSource').and.callThrough();
		component.setDataSource();
		expect(component.setDataSource).toHaveBeenCalled();
		expect(component.setDataSource()).toEqual(
			component.requestService.list<Lead>(expectedUri)
		);
	});


	it('should return the correct score icon', () => {
		const score = 75;
		const expectedIcon = getLeadScoreIcon(score);
		expect(component.getScoreIcon(score)).toEqual(expectedIcon);
	});

});
