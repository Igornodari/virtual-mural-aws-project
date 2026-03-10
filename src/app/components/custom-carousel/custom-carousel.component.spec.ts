import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CustomCarouselComponent } from './custom-carousel.component';
import { Lightbox, LightboxConfig, LightboxModule } from 'ngx-lightbox';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { mockUnit, mockUser } from 'src/app/shared/mocks/users/admin/card-grid-admin-mock';
import { AuthService } from 'src/app/services/auth.service';
import { RequestService } from 'src/app/services/request.service';

describe('CustomCarouselComponent', () => {
	let component: CustomCarouselComponent;
	let fixture: ComponentFixture<CustomCarouselComponent>;
	let lightbox: Lightbox;
	let lightboxConfig: LightboxConfig;
	let mockRequestService: any;

	const mockImages = [
		{ name: 'Image 1', url: 'http://example.com/image1.jpg' },
		{ name: 'Image 2', url: 'http://example.com/image2.jpg' },
		{ name: 'Image 3', url: 'http://example.com/image3.jpg' }
	];

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

		mockRequestService = jasmine.createSpyObj('RequestService', ['list', 'show', 'update']);
		mockRequestService.update.and.returnValue(of({}));
		await TestBed.configureTestingModule({
			imports: [
				CommonModule,
				LightboxModule,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: FakeLoader },
				}), CustomCarouselComponent
			],
			providers: [
				{ provide: Lightbox, useValue: jasmine.createSpyObj('Lightbox', ['open', 'close']) },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: RequestService, useValue: mockRequestService },
			]
		}).compileComponents();

		fixture = TestBed.createComponent(CustomCarouselComponent);
		component = fixture.componentInstance;
		lightbox = TestBed.inject(Lightbox);
		lightboxConfig = TestBed.inject(LightboxConfig);
		component.fileUrlArray = mockImages;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open lightbox when image is clicked', () => {
    // Ensure ngOnInit is called to initialize albums
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.albums).toEqual([
        { src: 'http://example.com/image1.jpg', caption: 'Image 1', thumb: 'http://example.com/image1.jpg' },
        { src: 'http://example.com/image2.jpg', caption: 'Image 2', thumb: 'http://example.com/image2.jpg' },
        { src: 'http://example.com/image3.jpg', caption: 'Image 3', thumb: 'http://example.com/image3.jpg' }
    ]);

    const images = fixture.debugElement.queryAll(By.css('.carousel-item'));
    images[1].nativeElement.click();
    fixture.detectChanges();
});
	it('should navigate to next slide', () => {
		spyOn(component.imageChange, 'emit');
		component.nextSlide();
		expect(component.currentSlide).toBe(1);
		expect(component.imageChange.emit).toHaveBeenCalledWith(1);
		component.nextSlide();
		expect(component.currentSlide).toBe(2);
		expect(component.imageChange.emit).toHaveBeenCalledWith(2);
		component.nextSlide();
		expect(component.currentSlide).toBe(0);
		expect(component.imageChange.emit).toHaveBeenCalledWith(0);
	});

	it('should navigate to previous slide', () => {
		spyOn(component.imageChange, 'emit');
		component.currentSlide = 2;

		component.prevSlide();
		expect(component.currentSlide).toBe(1);
		expect(component.imageChange.emit).toHaveBeenCalledWith(1);

		component.prevSlide();
		expect(component.currentSlide).toBe(0);
		expect(component.imageChange.emit).toHaveBeenCalledWith(0);

		component.prevSlide();
		expect(component.currentSlide).toBe(2);
		expect(component.imageChange.emit).toHaveBeenCalledWith(2);
	});

	it('should not change slide when empty array', () => {
		component.fileUrlArray = [];
		component.currentSlide = 0;

		component.nextSlide();
		expect(component.currentSlide).toBe(0);

		component.prevSlide();
		expect(component.currentSlide).toBe(0);
	});

	it('should display "No images" message when array is empty', () => {
		component.fileUrlArray = [];
		fixture.detectChanges();

		const noImagesElement = fixture.debugElement.query(By.css('p'));
		expect(noImagesElement.nativeElement.textContent).toContain('Não existem imagens');
	});

	it('should display images when array has items', () => {
		fixture.detectChanges();

		const images = fixture.debugElement.queryAll(By.css('.carousel-item'));
		expect(images.length).toBe(3);

		const noImagesElement = fixture.debugElement.query(By.css('p'));
		expect(noImagesElement).toBeNull();
	});

	it('should set active class on current slide', () => {
		component.currentSlide = 1;
		fixture.detectChanges();

		const items = fixture.debugElement.queryAll(By.css('.carousel-item'));
		expect(items[0].classes['active']).toBeFalsy();
		expect(items[1].classes['active']).toBeTruthy();
		expect(items[2].classes['active']).toBeFalsy();
	});

	it('should disable navigation buttons when no images', () => {
		component.fileUrlArray = [];
		fixture.detectChanges();

		const prevButton = fixture.debugElement.query(By.css('.carousel-control-prev'));
		const nextButton = fixture.debugElement.query(By.css('.carousel-control-next'));

		expect(prevButton.classes['disabled']).toBeTruthy();
		expect(nextButton.classes['disabled']).toBeTruthy();
	});

	it('should enable navigation buttons when images exist', () => {
		fixture.detectChanges();

		const prevButton = fixture.debugElement.query(By.css('.carousel-control-prev'));
		const nextButton = fixture.debugElement.query(By.css('.carousel-control-next'));

		expect(prevButton.classes['disabled']).toBeFalsy();
		expect(nextButton.classes['disabled']).toBeFalsy();
	});

	it('should initialize IntersectionObserver in ngAfterViewInit', fakeAsync(() => {
		const mockIntersectionObserver = {
			observe: jasmine.createSpy('observe'),
			unobserve: jasmine.createSpy('unobserve'),
			disconnect: jasmine.createSpy('disconnect')
		};

		spyOn(window, 'IntersectionObserver').and.returnValue(mockIntersectionObserver as any);

		component.ngAfterViewInit();
		tick();

		expect(window.IntersectionObserver).toHaveBeenCalled();
		expect(mockIntersectionObserver.observe).toHaveBeenCalled();
	}));

	it('should configure lightbox in constructor', () => {
		expect(lightboxConfig.fadeDuration).toBe(0.7);
		expect(lightboxConfig.resizeDuration).toBe(0.5);
		expect(lightboxConfig.centerVertically).toBeFalse();
	});
	it('should emit imageChange event when navigating', () => {
		spyOn(component.imageChange, 'emit');

		component.nextSlide();
		expect(component.imageChange.emit).toHaveBeenCalledWith(1);

		component.prevSlide();
		expect(component.imageChange.emit).toHaveBeenCalledWith(0);
	});

	it('should handle empty input array', () => {
		component.fileUrlArray = [];
		component.ngOnInit();
		fixture.detectChanges();

		expect(component.albums).toEqual([]);
		expect(component.currentSlide).toBe(0);

		const noImagesElement = fixture.debugElement.query(By.css('p'));
		expect(noImagesElement.nativeElement.textContent).toContain('Não existem imagens');
	});
});
