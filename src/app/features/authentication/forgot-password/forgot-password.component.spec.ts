import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { mockUnit, mockUser } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockAuthService: any;
  let mockSnackBarService: any;
  let mockTranslateService: any;

  class FakeLoader {
    getTranslation(lang: string) {
      return of({});
    }
  }

  beforeEach(async () => {
		mockAuthService = {
			forgotPassword: jasmine.createSpy('forgotPassword'),
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

    mockSnackBarService = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error')
    };
		const mockActivatedRoute = {
			snapshot: {
				params: {},
				queryParams: {}
			}
		};
    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,
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
				{ provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty email', () => {
    expect(component.form.value).toEqual({ email: '' });
  });

  it('should call forgotPassword and show success message on success', async () => {
    component.form.controls['email'].setValue('test@example.com');
    mockAuthService.forgotPassword.and.returnValue(of({}));

    await component.submit();

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    expect(component.send).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it('should show error message on error', async () => {
    component.form.controls['email'].setValue('test@example.com');
    mockAuthService.forgotPassword.and.returnValue(throwError(() => new Error('Failed')));
    await component.submit();
    expect(component.loading).toBeFalse();
  });
});
