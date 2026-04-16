import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  inject,
} from '@angular/core';
import BaseComponent from '../base.component';
import { Lightbox, LightboxConfig, LightboxModule } from 'ngx-lightbox';
import { importBase } from '../../shared/constant/import-base.constant';

@Component({
  selector: 'app-custom-carousel',
  imports: [...importBase, LightboxModule],
  providers: [Lightbox, LightboxConfig],
  templateUrl: './custom-carousel.component.html',
  styleUrls: ['./custom-carousel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomCarouselComponent extends BaseComponent implements OnInit, AfterViewInit {
  private lightbox = inject(Lightbox);
  private lightboxConfig = inject(LightboxConfig);

  @Input() fileUrlArray: { name: string; url: string }[] = [];
  @Output() imageChange = new EventEmitter<number>();
  @ViewChild('carousel')
  carousel!: ElementRef;
  currentSlide = 0;
  albums: { src: string; caption: string; thumb: string }[] = [];

  constructor() {
    super();
    this.lightboxConfig.fadeDuration = 0.2;
    this.lightboxConfig.resizeDuration = 0.5;
    this.lightboxConfig.centerVertically = true;
  }

  ngOnInit() {
    this.albums = this.fileUrlArray.map((image) => ({
      src: image.url,
      caption: image.name,
      thumb: image.url,
    }));
  }

  open(index: number): void {
    const items = this.fileUrlArray.map((image) => ({
      src: image.url,
      caption: image.name,
      thumb: image.url,
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
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const lazyImage = entry.target as HTMLImageElement;
              lazyImage.src = lazyImage.dataset['src']!;
              imgObserver.unobserve(lazyImage);
            }
          });
        },
        { threshold: 0.1 },
      );

      images.forEach((img: any) => {
        observer.observe(img);
      });
    }
  }
}
