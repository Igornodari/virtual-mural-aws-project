import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
	standalone: true,
	name: 'newLine',
})
export class NewLine implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	transform(value: string): SafeHtml {
		const text = (value ?? '').toString();
		// substitui \n por <br>
		const html = text.replace(/\r?\n/g, '<br>');
		return this.sanitizer.bypassSecurityTrustHtml(html);
	}
}
