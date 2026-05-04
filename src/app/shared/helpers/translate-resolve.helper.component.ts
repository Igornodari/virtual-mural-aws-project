import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslateResolver implements Resolve<Observable<string>> {
  private translate = inject(TranslateService);


  resolve(route: import('@angular/router').ActivatedRouteSnapshot): Observable<string> {
    const titleKey = route.data['title'];
    return of(this.translate.instant(titleKey));
  }
}
