
import {
	Component,
	ElementRef,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import BaseComponent from '../base.component';
import { Lightbox, LightboxConfig, LightboxModule } from 'ngx-lightbox';
import { importBase } from '../../shared/constant/import-base.constant';

@Component({
    selector: 'app-custom-carousel',
    imports: [...importBase, LightboxModule],
    providers: [Lightbox, LightboxConfig],
    template: `
		<div class="carousel-container">
		  <a
		    class="carousel-control-prev f-s-24 p-10 m-t-20"
		    (click)="prevSlide()"
		    [class.disabled]="fileUrlArray.length === 0"
		    >&#10094;</a
		    >
		    @if (fileUrlArray.length > 0) {
		      <div class="d-flex" #carousel>
		        @for (slide of fileUrlArray; track slide; let i = $index) {
		          <div
		            class="carousel-item"
		            [class.active]="i === currentSlide"
		            (click)="open(i)"
		            >
		            <img [attr.data-src]="slide.url" width="300" height="200" alt="voucher image" />
		            <div class="row text-center d-flex justify-content-center align-items-center">
		              <span class="f-w-600">{{ slide.name | translate }}</span>
		            </div>
		          </div>
		        }
		      </div>
		    } @else {
		      <p>Não existem imagens</p>
		    }
		    <a
		      class="carousel-control-next f-s-24 p-10 m-t-20"
		      (click)="nextSlide()"
		      [class.disabled]="fileUrlArray.length === 0"
		      >&#10095;</a
		      >
		    </div>
		`,
    styleUrls: ['./custom-carousel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CustomCarouselComponent extends BaseComponent {
	@Input() fileUrlArray: { name: string; url: string }[] = [];
	@Output() imageChange = new EventEmitter<number>();
	@ViewChild('carousel')
  carousel!: ElementRef;
	currentSlide = 0;
	albums: { src: string; caption: string; thumb: string }[] = [];

	constructor(private lightbox: Lightbox, private lightboxConfig: LightboxConfig) {
		super();
		this.lightboxConfig.fadeDuration = 0.2;
		this.lightboxConfig.resizeDuration = 0.5;
		this.lightboxConfig.centerVertically = true;
	}

	ngOnInit() {
		this.albums = this.fileUrlArray.map(image => ({
			src: image.url,
			caption: image.name,
			thumb: image.url,
		}));
	}

	open(index: number): void {
		const items = this.fileUrlArray.map(image => ({
			src: image.url,
			caption: image.name,
			thumb: image.url
		}));
		this.lightbox.open(items, index);
	}

	close(): void {
		this.lightbox.close();
	}

	nextSlide() {
		if (this.fileUrlArray && this.fileUrlArray.length > 0) {
			this.currentSlide = (this.currentSlide + 1) % this.fileUrlArray.length;
			this.imageChange.emit(this.currentSlide);
		}
	}

	prevSlide() {
		if (this.fileUrlArray && this.fileUrlArray.length > 0) {
			this.currentSlide =
				(this.currentSlide - 1 + this.fileUrlArray.length) % this.fileUrlArray.length;
			this.imageChange.emit(this.currentSlide);
		}
	}

	ngAfterViewInit(): void {
		if (this.carousel) {
			const images = this.carousel.nativeElement.querySelectorAll('img');
			const observer = new IntersectionObserver(
				(entries, imgObserver) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							const lazyImage = entry.target as HTMLImageElement;
							lazyImage.src = lazyImage.dataset['src']!;
							imgObserver.unobserve(lazyImage);
						}
					});
				},
				{ threshold: 0.1 }
			);

			images.forEach((img: any) => {
				observer.observe(img);
			});
		}
	}
}
