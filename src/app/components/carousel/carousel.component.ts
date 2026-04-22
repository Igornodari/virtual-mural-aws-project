import { Component } from '@angular/core';
import { importBase } from '../../shared/constant/import-base.constant';

@Component({
	selector: 'app-carousel',
	templateUrl: './carousel.component.html',
	styleUrls: ['./carousel.component.scss'],
	standalone: true,
	imports: [...importBase],
})
export class ProductCarouselComponent {
	items = [
		{
			image: 'https://via.placeholder.com/800x400',
			title: 'Item 1',
			description: 'Descrição do Item 1',
		},
		{
			image: 'https://via.placeholder.com/800x400',
			title: 'Item 2',
			description: 'Descrição do Item 2',
		},
		{
			image: 'https://via.placeholder.com/800x400',
			title: 'Item 3',
			description: 'Descrição do Item 3',
		},
	];

	currentIndex = 0;

	prev() {
		this.currentIndex = this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1;
	}

	next() {
		this.currentIndex = this.currentIndex === this.items.length - 1 ? 0 : this.currentIndex + 1;
	}

	goToIndex(index: number) {
		this.currentIndex = index;
	}
}
