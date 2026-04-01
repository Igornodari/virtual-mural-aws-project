import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { DetailCardGridComponent } from './detail-card-grid.component';
import { Admin } from 'src/app/shared/types';
import { RequestService } from 'src/app/services/request.service';
import { labeGridAdminsMap } from 'src/app/shared/helpers/iconMap.helper';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Location } from '@angular/common';
import { mockAdmin } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';

describe('DetailCardGridComponent', () => {
	let component: DetailCardGridComponent;
	let fixture: ComponentFixture<DetailCardGridComponent>;
	let requestServiceSpy: jasmine.SpyObj<RequestService>;


	// Mock para TranslateService
	const translateServiceMock = {
		get: jasmine.createSpy('get').and.returnValue(of('')),
		instant: jasmine.createSpy('instant').and.returnValue(''),
	};

	// Mock para AnalyticsService
	const analyticsServiceMock = {
		logEvent: jasmine.createSpy('logEvent'),
	};

	// Mock para AuthService com Observables
	const authServiceMock = {
		$user: of(mockAdmin.user),
		$unit: of(mockAdmin.unit),
		isAuthenticated$: of(true),
		login: jasmine.createSpy('login'),
		logout: jasmine.createSpy('logout'),
	};

	beforeEach(async () => {
		const activatedRouteStub = { snapshot: { params: { id: '123' } } };
		const requestServiceMock = jasmine.createSpyObj('RequestService', ['get']);

		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule, MatDialogModule, DetailCardGridComponent],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: RequestService, useValue: requestServiceMock },
				{ provide: TranslateService, useValue: translateServiceMock },
				{ provide: AnalyticsService, useValue: analyticsServiceMock },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DetailCardGridComponent);
		component = fixture.componentInstance;
		requestServiceSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
		requestServiceSpy.get.and.returnValue(of(mockAdmin));
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call loadAdminDetails on ngOnInit', () => {
		spyOn(component, 'loadAdminDetails');
		component.ngOnInit();
		expect(component.loadAdminDetails).toHaveBeenCalledWith('123');
	});

	it('should call requestService.get with correct URL in loadAdminDetails', () => {
		component.loadAdminDetails('123');
		expect(requestServiceSpy.get).toHaveBeenCalledWith(`${URI_PATH.CORE.ADMIN}/123`);
	});

	it('should set admin$ observable on loadAdminDetails', done => {
		component.loadAdminDetails('123');
		component.admin$.subscribe(admin => {
			expect(admin).toEqual(mockAdmin);
			done();
		});
	});

	it('should return correct label from getCorrectLabel', () => {
		const departmentKey = 'IT';
		expect(component.getCorrectLabel(departmentKey)).toBe(labeGridAdminsMap[departmentKey]);
	});
});
