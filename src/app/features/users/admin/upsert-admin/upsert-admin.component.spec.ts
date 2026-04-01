import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RequestService } from 'src/app/services/request.service';
import { Router } from '@angular/router';
import { provideNgxMask, IConfig } from 'ngx-mask';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from 'src/app/services/auth.service';
import { mockAdmin, mockUnit, mockUser } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { UpsertAdminComponent } from './upsert-admin.component';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { Admin } from 'src/app/shared/types';

describe('UpsertAdminComponent', () => {
	let component: UpsertAdminComponent;
	let fixture: ComponentFixture<UpsertAdminComponent>;
	let mockRequestService: jasmine.SpyObj<RequestService>;
	let mockSnackBarService: jasmine.SpyObj<SnackBarService>;
	let mockRouter: jasmine.SpyObj<Router>;
	let mockDialogRef: jasmine.SpyObj<MatDialogRef<UpsertAdminComponent>>;

	const maskConfig: Partial<IConfig> = {
		validation: false,
	};

	const mockAuthService = {
		$unit: of(mockUnit || {}),
		$user: of(mockUser || {}),
		currentUser: {
			...mockUser,
			role: {
				name: 'admin',
				permissions: [{ name: 'admin-access' }],
			},
		},
	};

	beforeEach(async () => {
		// Configuração dos mocks
		mockRequestService = jasmine.createSpyObj('RequestService', ['get', 'post', 'update', 'list']);
		mockRequestService.list.and.returnValue(
			of({
				data: [
					{
						id: 'role-1',
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-02T00:00:00Z',
						name: 'Admin',
						label: 'Administrator',
						permissions: [
							{
								active: true,
								id: 'permission-1',
								createdAt: '2023-01-01T00:00:00Z',
								updatedAt: '2023-01-02T00:00:00Z',
								name: 'admin-access',
								label: 'Admin Access',
							},
							{
								active: true,
								id: 'permission-2',
								createdAt: '2023-01-01T00:00:00Z',
								updatedAt: '2023-01-02T00:00:00Z',
								name: 'user-manage',
								label: 'Manage Users',
							},
						],
					},
					{
						id: 'role-2',
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-02T00:00:00Z',
						name: 'Editor',
						label: 'Content Editor',
						permissions: [
							{
								active: true,
								id: 'permission-3',
								createdAt: '2023-01-01T00:00:00Z',
								updatedAt: '2023-01-02T00:00:00Z',
								name: 'edit-content',
								label: 'Edit Content',
							},
						],
					},
				],
				paginate: {
					total: 2,
					page: 1,
					limit: 10,
					order: {
						createdAt: 'asc',
					},
					where: [],
				},
			})
		);

		mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['success']);
		mockRouter = jasmine.createSpyObj('Router', ['navigate']);
		mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [
				UpsertAdminComponent,
				ReactiveFormsModule,
				BrowserAnimationsModule,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } },
				}),
			],
			providers: [
				provideHttpClientTesting(),
				provideNgxMask(maskConfig),
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: RequestService, useValue: mockRequestService },
				{ provide: SnackBarService, useValue: mockSnackBarService },
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialogRef, useValue: mockDialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: mockAdmin },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(UpsertAdminComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize form with admin data', () => {
		expect(component.formGroup.value).toEqual({
			fullName: mockAdmin.fullName,
			email: mockAdmin.email,
			cpf: mockAdmin.cpf,
			birthDate: mockAdmin.birthDate.split('T')[0],
			addressStreet: mockAdmin.addressStreet,
			addressNumber: mockAdmin.addressNumber,
			addressComplement: mockAdmin.addressComplement,
			addressState: mockAdmin.addressState,
			addressNeighborhood: mockAdmin.addressNeighborhood,
			addressCountry: mockAdmin.addressCountry,
			addressCity: mockAdmin.addressCity,
			addressZipCode: mockAdmin.addressZipCode,
			department: mockAdmin.department,
			position: mockAdmin.position,
			roleId: mockAdmin.user.role.id,
			unitId: mockAdmin.unit.id,
			isActive: mockAdmin.user.isActive,
		});
	});

	it('should call requestService.list on initialization', () => {
		expect(mockRequestService.list).toHaveBeenCalled();
	});

	it('should close the dialog with false', () => {
		component.close();
		expect(mockDialogRef.close).toHaveBeenCalledWith(false);
	});

	it('should call post on requestService when admin is not defined', () => {
		component.admin = undefined as unknown as Admin;
		const postSpy = mockRequestService.post.and.returnValue(of({}));

		component.onConfirm();

		expect(postSpy).toHaveBeenCalledWith(URI_PATH.CORE.ADMIN, component.formGroup.value);
		expect(component.loading).toBe(false);
		expect(mockSnackBarService.success).toHaveBeenCalledWith('Dados salvos!');
		expect(mockDialogRef.close).toHaveBeenCalledWith(true);
	});

	it('should call update on requestService when admin is defined', () => {
		component.admin = mockAdmin;
		const updateSpy = mockRequestService.update.and.returnValue(of({}));

		component.onConfirm();

		expect(updateSpy).toHaveBeenCalledWith(
			URI_PATH.CORE.ADMIN,
			mockAdmin.id,
			component.formGroup.value
		);
		expect(component.loading).toBe(false);
		expect(mockSnackBarService.success).toHaveBeenCalledWith('Dados salvos!');
		expect(mockDialogRef.close).toHaveBeenCalledWith(true);
	});


	it('should call populateForm and detectChanges when admin exists on ngAfterViewInit', () => {
		spyOn(component, 'populateForm');
		spyOn(component['cdr'], 'detectChanges');

		component.admin = mockAdmin;
		component.ngAfterViewInit();

		expect(component.populateForm).toHaveBeenCalled();
		expect(component['cdr'].detectChanges).toHaveBeenCalled();
	});


	it('should not call populateForm or detectChanges when admin does not exist on ngAfterViewInit', () => {
		spyOn(component, 'populateForm');
		spyOn(component['cdr'], 'detectChanges');

		component.admin = null as unknown as Admin;
		component.ngAfterViewInit();

		expect(component.populateForm).not.toHaveBeenCalled();
		expect(component['cdr'].detectChanges).not.toHaveBeenCalled();
	});


	it('should initialize the form correctly when admin is not provided', () => {
		component.admin = null as unknown as Admin;

		const formGroup = component.createFormGroup();

		expect(formGroup.controls['fullName']).toBeDefined();
		expect(formGroup.controls['email']).toBeDefined();
		expect(formGroup.controls['cpf']).toBeDefined();
		expect(formGroup.controls['isActive'].value).toBe(true);
	});

});
