import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { LinkAccountDialogComponent } from './link-account-dialog.component';
import { of } from 'rxjs';
import { mockUnit, mockUser } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { RequestService } from 'src/app/services/request.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { mockOccupancy } from 'src/app/shared/mocks/occupancy/mock-occupancy';

describe('LinkAccountDialogComponent', () => {
	let component: LinkAccountDialogComponent;
	let fixture: ComponentFixture<LinkAccountDialogComponent>;
	let mockDialogRef: jasmine.SpyObj<MatDialogRef<LinkAccountDialogComponent>>;

	let mockRequestService: any;
	let mockRouter: any;

	const mockDialogData = { title: 'Test Title', message: 'Test Message' };
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

		mockRequestService = {
				show: jasmine.createSpy('show').and.returnValue(of(mockOccupancy)),
				list: jasmine.createSpy('list').and.returnValue(of({ data: [] })),
			};

	beforeEach(async () => {
		mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [LinkAccountDialogComponent,
				BrowserAnimationsModule,
				MatDialogModule,
				ReactiveFormsModule,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader },
				}),
			],
			providers: [
				{ provide: MatDialogRef, useValue: mockDialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: mockDialogData },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: RequestService, useValue: mockRequestService },
				{ provide: Router, useValue: mockRouter },
			]
		}).compileComponents();

		fixture = TestBed.createComponent(LinkAccountDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should inject MAT_DIALOG_DATA', () => {
		expect(component.data).toEqual(mockDialogData);
	});

	it('should inject MatDialogRef', () => {
		expect(component.dialogRef).toBeTruthy();
	});
	it('should display dialog data in template', () => {
		const compiled = fixture.nativeElement;
		expect(compiled.querySelector('h2').textContent).toContain('LOGIN.DIALOG_EXISTING_ACCOUNT.TITLE' );
		expect(compiled.querySelector('p').textContent).toContain('LOGIN.DIALOG_EXISTING_ACCOUNT.LINE1');
	});
});
