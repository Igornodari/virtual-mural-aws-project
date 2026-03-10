import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class AppTranslateLoader implements TranslateLoader {
	constructor(
		private http: HttpClient,
		private config: { prefix?: string; suffix?: string; parts?: string[] }
	) {}

	getTranslation(lang: string): Observable<any> {
		const prefix = this.config?.prefix ?? './assets/i18n/';
		const suffix = this.config?.suffix ?? '.json';
		const parts = this.config?.parts ?? ['pt', 'en'];
		const requests = parts.map(part =>
			this.http.get(`${prefix}${lang}/${part}${suffix}`).pipe(catchError(() => of({})))
		);

		return forkJoin(requests).pipe(
			map(translations => translations.reduce((acc, curr) => ({ ...acc, ...curr }), {}))
		);
	}
}
