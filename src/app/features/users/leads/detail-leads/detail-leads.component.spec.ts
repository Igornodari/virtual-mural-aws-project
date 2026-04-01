import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DetailLeadsComponent } from './detail-leads.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { RequestService } from 'src/app/services/request.service';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { Lead } from '../lead.type';
import { mockAdmin } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('DetailLeadsComponent', () => {
	let component: DetailLeadsComponent;
	let fixture: ComponentFixture<DetailLeadsComponent>;
	let mockRequestService: jasmine.SpyObj<RequestService>;
	let mockActivatedRoute: Partial<ActivatedRoute>;

	beforeEach(async () => {

		const authServiceMock = {
			$user: of(mockAdmin.user),
			$unit: of(mockAdmin.unit),
			isAuthenticated$: of(true),
			login: jasmine.createSpy('login'),
			logout: jasmine.createSpy('logout'),
		};

		class FakeLoader implements TranslateLoader {
			getTranslation(lang: string) {
				return of({});
			}
		}

		const mockSnackBarService = {
			open: jasmine.createSpy('open'),
		};

		mockRequestService = jasmine.createSpyObj('RequestService', ['show']);
		mockActivatedRoute = {
			paramMap: of({ get: (key: string) => '123' }) as any,
		};

		TestBed.configureTestingModule({
			imports: [importBase, DetailLeadsComponent,
				BrowserAnimationsModule,
				MatDialogModule,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader },
				}),
			],
			providers: [
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				{ provide: RequestService, useValue: mockRequestService },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: SnackBarService, useValue: mockSnackBarService },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(DetailLeadsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with an ID from the route params', () => {
		expect(component.id).toBe('123');
	});

	it('should load lead details on initialization', async () => {
		const mockLead: Lead = { id: '123', name: 'Test Lead' } as any;
		mockRequestService.show.and.returnValue(of(mockLead));

		await component.loadLeadDetails('123');
		expect(component.lead$).toBeDefined();
	});

	it('should calculate matching compatibility correctly', () => {
		const mockMatching = [
			{ total: 30 },
			{ total: 20 },
			{ total: 10 },
		];

		mockRequestService.show.and.returnValue(of(mockMatching));

		component.getMatching();

		expect(component.matchings.length).toBe(3);
		expect(component.matchingTypology.total).toBeGreaterThan(0);
	});

	it('should return correct compatibility styles', () => {
		expect(component.getCompatibleStyle(90).label).toBe('Excelente');
		expect(component.getCompatibleStyle(70).label).toBe('Compativel');
		expect(component.getCompatibleStyle(30).label).toBe('Incompatível');
	});
});
