import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivityModalComponent } from './activity-modal.component';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { NewLine } from 'src/app/shared/pipe/new-line.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';
import {
	mockAdmin,
	mockUnit,
	mockUser,
} from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { RequestService } from 'src/app/services/request.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

describe('ActivityModalComponent', () => {
	let component: ActivityModalComponent;
	let fixture: ComponentFixture<ActivityModalComponent>;
	let mockRequestService: any;
	let mockDialogRef: jasmine.SpyObj<MatDialogRef<ActivityModalComponent>>;

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
	mockRequestService.list.and.returnValue(
		of({
			data: [mockAdmin],
			paginate: { total: 50 },
		})
	);

	class FakeLoader implements TranslateLoader {
		getTranslation(lang: string) {
			return of({
				'HISTORY_COMPONENT.TITLE': 'Activity Log',
				NO_RESULTS: 'No results found',
				CLOSE: 'Close',
			});
		}
	}

	beforeEach(async () => {
		mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [
				importBase,
				NewLine,
				ActivityModalComponent,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader },
				}),
			],
			providers: [
				provideHttpClientTesting(),
				{ provide: MatDialogRef, useValue: mockDialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: { activityLogs: [] } },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: RequestService, useValue: mockRequestService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ActivityModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display no data message when activityLogs is empty', () => {
		const noDataElement = fixture.debugElement.query(By.css('.no-data'));
		expect(noDataElement).toBeTruthy();

		const icon = noDataElement.query(By.css('mat-icon'));
		expect(icon.nativeElement.textContent.trim()).toBe('info');

		const text = noDataElement.query(By.css('span'));
		expect(text.nativeElement.textContent.trim()).toBe('NO_RESULTS');
	});

	it('should close dialog when close button is clicked', () => {
		const closeButton = fixture.debugElement.query(By.css('.close-button'));
		closeButton.nativeElement.click();
		expect(mockDialogRef.close).toHaveBeenCalled();
	});
});
