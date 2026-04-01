import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CardGridAdminComponent } from './card-grid-admin.component';
import { AuthService } from 'src/app/services/auth.service';
import { RequestService } from 'src/app/services/request.service';
import {
	mockAdmin,
	mockUnit,
	mockUser,
} from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { IConfig, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { UpsertAdminComponent } from '../upsert-admin/upsert-admin.component';

describe('CardGridAdminComponent', () => {
	let component: CardGridAdminComponent;
	let fixture: ComponentFixture<CardGridAdminComponent>;
	let mockRequestService: any;
	let mockRouter: any;
	let mockDialog: any;

	beforeEach(async () => {
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

		class FakeLoader implements TranslateLoader {
			getTranslation(lang: string) {
				return of({});
			}
		}
		const mockSnackBarService = {
			open: jasmine.createSpy('open'),
		};

		const maskConfig: Partial<IConfig> = {
			validation: false,
		};

		mockRequestService = jasmine.createSpyObj(['list']);
		mockRequestService.list.and.returnValue(
			of({
				data: [mockAdmin],
				paginate: { total: 50 },
			})
		);
		mockRouter = jasmine.createSpyObj('Router', ['navigate']);

		await TestBed.configureTestingModule({
			imports: [
				CardGridAdminComponent,
				BrowserAnimationsModule,
				MatDialogModule,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader },
				}),
			],
			providers: [
				provideNgxMask(maskConfig),
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: RequestService, useValue: mockRequestService },
				{ provide: MatDialog, useValue: {} },
				{ provide: Router, useValue: mockRouter },
				{ provide: ActivatedRoute, useValue: { snapshot: { params: { id: '1' } } } },
				{ provide: SnackBarService, useValue: mockSnackBarService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CardGridAdminComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should navigate to view employee page', fakeAsync(() => {
		component.onViewEmployee(mockAdmin);
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/users/admin/show/', 'admin-001']);
		fixture.detectChanges();
	}));

	it('should load more employees when hasMore is true', fakeAsync(() => {
		component.hasMore = true;
		component.page = 1;
		component.loadMore();
		tick();
		expect(mockRequestService.list).toHaveBeenCalled();
		expect(component.page).toBe(2);
	}));

	it('should open dialog with admin data in openDialog', () => {
		const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
		const adminData = mockAdmin;
		component['_dialog'] = mockDialog;

		const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
		dialogRefSpy.afterClosed.and.returnValue(of(true));
		mockDialog.open.and.returnValue(dialogRefSpy);

		spyOn(component, 'loadEmployees');

		component.openDialog(adminData);

		expect(mockDialog.open).toHaveBeenCalledWith(UpsertAdminComponent, { data: adminData });
		expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
		expect(component.loadEmployees).toHaveBeenCalled();
	});
});
