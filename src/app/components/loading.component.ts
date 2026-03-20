import { Component, ViewEncapsulation } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading',
    imports: [MatProgressSpinnerModule],
    template: '<div class="loading"><mat-spinner color="warn" diameter="50"></mat-spinner></div>',
    encapsulation: ViewEncapsulation.None
})

export class LoadingComponent {

}
