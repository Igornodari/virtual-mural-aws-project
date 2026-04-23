import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  standalone: true,
  name: 'newLine',
})
export class NewLine implements PipeTransform {
  private sanitizer = inject(DomSanitizer);


  constructor() {}

  transform(value: string): SafeHtml {
    const text = (value ?? '').toString();
    // substitui \n por <br>
    const html = text.replace(/\r?\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
