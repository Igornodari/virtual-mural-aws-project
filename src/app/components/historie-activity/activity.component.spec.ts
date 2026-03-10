import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivityComponent } from './activity.component';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { RequestService } from 'src/app/services/request.service';
import { By } from '@angular/platform-browser';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import {
	mockAdmin,
	mockUnit,
	mockUser,
} from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { DialogService } from 'src/app/services/dialog.service';
import { EventEmitter } from '@angular/core';

describe('ActivityComponent', () => {
	let component: ActivityComponent;
	let fixture: ComponentFixture<ActivityComponent>;
	let mockRequestService: jasmine.SpyObj<RequestService>;
	let mockDialog: any;
	let mockSnackBarService: any;
	let mockDialogService: any;

	const mockActivityLogs = [
		{
			id: '2',
			createdAt: new Date('2023-01-02'),
			action: 'Updated',
			details: 'Updated user permissions',
			tableId: '1',
			table: '2',
			admin: mockAdmin,
			user: mockUser,
		},
	];

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

	mockDialogService = {
		openDialogConfirmation: jasmine.createSpy('openDialogConfirmation').and.returnValue({
			afterClosed: () => of(true),
		}),
	};

	mockSnackBarService = {
		open: jasmine.createSpy('open'),
		success: jasmine.createSpy('success'),
		error: jasmine.createSpy('error'),
	};

	beforeEach(async () => {
		mockRequestService = jasmine.createSpyObj('RequestService', ['getActivities']);
		mockRequestService.getActivities.and.returnValue(of(mockActivityLogs));

		mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
		const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
		mockDialogRef.afterClosed.and.returnValue(of(true));
		mockDialog.open.and.returnValue(mockDialogRef);

		class FakeLoader implements TranslateLoader {
			getTranslation(lang: string) {
				return of({
					'HISTORY_COMPONENT.SEE_HISTORY': 'See History',
				});
			}
		}

		await TestBed.configureTestingModule({
			imports: [
				importBase,
				ActivityComponent,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader },
				}),
			],
			providers: [
				{ provide: RequestService, useValue: mockRequestService },
				{ provide: MatDialog, useValue: mockDialog },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: SnackBarService, useValue: mockSnackBarService },
				{ provide: DialogService, useValue: mockDialogService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ActivityComponent);
		component = fixture.componentInstance;
		component.table = 'test-table';
		component.id = 'test-id';
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should call openActivityModal when the button is clicked', () => {
		spyOn(component, 'openActivityModal');
		const button = fixture.debugElement.query(By.css('button'));
		button.triggerEventHandler('click', null);
		expect(component.openActivityModal).toHaveBeenCalled();
	});

	it('should subscribe to $event and call fetchActivities when $event is emitted', () => {
		component.$event = new EventEmitter<boolean>();
		spyOn(component, 'fetchActivities');
		component.ngOnInit();
		component.$event.emit(true);
		expect(component.fetchActivities).toHaveBeenCalled();
	});

	it('should call getActivities with correct parameters in fetchActivities', () => {
		component.table = 'test-table';
		component.id = 'test-id';
		component.fetchActivities();
		expect(mockRequestService.getActivities).toHaveBeenCalledWith('test-table', 'test-id');
	});

	it('should display correct button text', () => {
		const button = fixture.debugElement.query(By.css('button')).nativeElement;
		expect(button.textContent).toContain('history HISTORY_COMPONENT.SEE_HISTORY');
	});

	it('should have mat-icon in button', () => {
		const icon = fixture.debugElement.query(By.css('button mat-icon'));
		expect(icon).toBeTruthy();
	});

	it('should set activityLogs$ when fetchActivities is called', () => {
		component.fetchActivities();
		expect(component.activityLogs$).toBeDefined();
		component.activityLogs$.subscribe(logs => {
			expect(logs).toEqual(mockActivityLogs);
		});
	});
});
