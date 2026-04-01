import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login.component';
import { mockUnit, mockUser } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';


describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let mockAuthService: any;
	let mockSnackBarService: any;
	let fakeResult: any;

	beforeEach(async () => {

		mockAuthService = {
			loginWithEmail: jasmine.createSpy('loginWithEmail').and.returnValue(Promise.resolve()),
			loginDev: jasmine.createSpy('loginDev').and.returnValue({ add: (fn: () => void) => fn() }),
			loginProviderGoogle: jasmine.createSpy('loginProviderGoogle').and.returnValue(Promise.resolve()),
			authenticationWithToken: jasmine.createSpy('authenticationWithToken').and.returnValue(Promise.resolve()),
			logoutFirebase: jasmine.createSpy('logoutFirebase').and.returnValue(Promise.resolve()),
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


		class FakeLoader {
			getTranslation(lang: string) {
				return of({});
			}
		}
		mockSnackBarService = {
			success: jasmine.createSpy('success'),
			error: jasmine.createSpy('error')
		};

		fakeResult = { user: { email: 'test@microsoft.com' } };

		const mockActivatedRoute = {
			snapshot: {
				paramMap: {
					get: (key: string) => null
				}
			}
		};

		await TestBed.configureTestingModule({
			imports: [
				LoginComponent,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				FormsModule,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader }
				})
			],
			providers: [
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: SnackBarService, useValue: mockSnackBarService },
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
			]
		}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have an invalid form when fields are empty', () => {
		component.form.setValue({ username: '', password: '' });
		expect(component.form.invalid).toBeTrue();
	});

	it('should call loginWithEmail on submit when form is valid and not admin', async () => {
		component.form.setValue({ username: 'test@example.com', password: '12345678' });
		component.admin = null;
		await component.submit();
		expect(mockAuthService.loginWithEmail).toHaveBeenCalledWith('test@example.com', '12345678');
	});

	it('should call loginDev on submit when form is valid and admin is set', async () => {
		component.form.setValue({ username: 'admin@example.com', password: 'adminpass' });
		component.admin = 'true';
		await component.submit();
		expect(mockAuthService.loginDev).toHaveBeenCalledWith('admin@example.com', 'adminpass');
	});

	it('should call loginProviderGoogle and handle success', async () => {
		await component.loginGoogle();
		expect(mockAuthService.loginProviderGoogle).toHaveBeenCalled();
		expect(component.loading).toBeFalse();
	});

	it('should call loginProviderGoogle and handle auth error', fakeAsync(() => {
		mockAuthService.loginProviderGoogle.and.returnValue(Promise.reject({ code: 'auth/admin-restricted-operation' }));
		component.loginGoogle();
		tick();
		expect(mockSnackBarService.error).toHaveBeenCalledWith('LOGIN.ERROR_NOT_REGISTERED');
		expect(component.loading).toBeFalse();
	}));

	it('should have a valid form when fields are correctly filled', () => {
		component.form.setValue({ username: 'user@test.com', password: '12345678' });
		expect(component.form.valid).toBeTrue();
	});

	it('should not call login if form is invalid', async () => {
		component.form.setValue({ username: '', password: '' });
		await component.submit();
		expect(mockAuthService.loginWithEmail).not.toHaveBeenCalled();
		expect(mockAuthService.loginDev).not.toHaveBeenCalled();
	});

	it('should show generic error if loginGoogle fails with unknown error', fakeAsync(() => {
		mockAuthService.loginProviderGoogle.and.returnValue(Promise.reject({ code: 'some-other-error' }));
		component.loginGoogle();
		tick();
		expect(mockSnackBarService.error).toHaveBeenCalledWith('LOGIN.ERROR_CONTACT_ADMIN');
		expect(component.loading).toBeFalse();
	}));

	it('should return form controls with getter f', () => {
		expect(component.f.username).toBeDefined();
		expect(component.f.password).toBeDefined();
	});

	it('should call snackBar.success with linked message if linked is true', async () => {
		await component['finishLogin'](true);
		expect(mockSnackBarService.success).toHaveBeenCalledWith('LOGIN.SUCCESS_LINKED');
	});

	it('should call snackBar.success with standard message if linked is false', async () => {
		await component['finishLogin']();
		expect(mockSnackBarService.success).toHaveBeenCalledWith('LOGIN.SUCCESS');
	});

	it('should detect microsoft and google linked accounts', () => {
		expect(component['isMicrosoftAndGoogleLinked'](['microsoft.com', 'google.com'])).toBeTrue();
	});

	it('should detect only microsoft linked', () => {
		expect(component['isOnlyMicrosoftLinked'](['microsoft.com'])).toBeTrue();
	});

	it('should detect google linked', () => {
		expect(component['isGoogleLinked'](['google.com'])).toBeTrue();
	});
});
