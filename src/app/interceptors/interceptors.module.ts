import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorInterceptor } from './response/error.interceptor';
import { RequestInterceptor } from './request/request.interceptor';

@NgModule({
	declarations: [],
	imports: [],
	providers: [
		provideHttpClient(withInterceptorsFromDi()),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: ErrorInterceptor,
			multi: true,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: RequestInterceptor,
			multi: true,
		},
	],
})
export class InterceptorsModule {}
