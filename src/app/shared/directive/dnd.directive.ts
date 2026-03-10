import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
    selector: '[appDnd]',
    standalone: false
})
export class DndDirective {
	@HostBinding('class.fileover') fileOver: boolean;
	@Output() fileDropped = new EventEmitter<any>();

	@HostListener('dragover', ['$event']) onDragOver(evt: DragEvent) {
		evt.preventDefault();
		evt.stopPropagation();
		this.fileOver = true;
	}

	// Dragleave listener
	@HostListener('dragleave', ['$event'])
	public onDragLeave(evt: DragEvent) {
		evt.preventDefault();
		evt.stopPropagation();
		this.fileOver = false;
	}

	// Drop listener
	@HostListener('drop', ['$event'])
	public ondrop(evt: DragEvent) {
		evt.preventDefault();
		evt.stopPropagation();
		this.fileOver = false;
		let files = evt.dataTransfer?.files;
		if (files && files.length > 0) {
			this.fileDropped.emit(files);
		}
	}

	constructor() {
		this.fileOver = false;
	}
}
