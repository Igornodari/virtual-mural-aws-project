import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RequestService } from 'src/app/services/request.service';
import { DetailClientsComponent } from './detail-clients.component';
import { mockAdmin } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { AuthService } from 'src/app/services/auth.service';

describe('DetailClientsComponent', () => {
	let component: DetailClientsComponent;
	let fixture: ComponentFixture<DetailClientsComponent>;
	let requestServiceSpy: jasmine.SpyObj<RequestService>;

	beforeEach(async () => {
    const activatedRouteStub = {
        snapshot: { params: { id: '123' } },
    };

    const translateServiceMock = {
        get: jasmine.createSpy('get').and.returnValue(of('')),
        instant: jasmine.createSpy('instant').and.returnValue(''),
    };

    const analyticsServiceMock = {
        logEvent: jasmine.createSpy('logEvent'),
    };

    const authServiceMock = {
        $user: of(mockAdmin.user),
        $unit: of(mockAdmin.unit),
        isAuthenticated$: of(true),
        login: jasmine.createSpy('login'),
        logout: jasmine.createSpy('logout'),
    };

    requestServiceSpy = jasmine.createSpyObj('RequestService', ['show']);

    await TestBed.configureTestingModule({
        imports: [DetailClientsComponent],
        providers: [
            { provide: ActivatedRoute, useValue: activatedRouteStub },
            { provide: RequestService, useValue: requestServiceSpy },
            { provide: TranslateService, useValue: translateServiceMock },
            { provide: AnalyticsService, useValue: analyticsServiceMock },
            { provide: AuthService, useValue: authServiceMock },
            { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) },
        ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailClientsComponent);
    component = fixture.componentInstance;
});


	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should get clientId from route params', () => {
		component.ngOnInit();
		expect(component.clientId).toBe('123');
	});

	it('should load client details successfully', fakeAsync(async () => {
		requestServiceSpy.show.and.returnValue(of(mockAdmin));
		await component.ngOnInit();
		tick();
		expect(requestServiceSpy.show).toHaveBeenCalledWith('core/clients', '123');
		expect(component.loading).toBeFalse();
	}));
});
