import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './shared/guard/auth.guard';
import { BlankComponent } from './layouts/blank/blank.component';

export const routes: Routes = [
	{
		path: '',
		component: FullComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('./features/pages.module').then(m => m.PagesModule),
			},
			{
				path: 'users',
				loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
			},
		],
	},
	{
		path: '',
		component: BlankComponent,
		children: [
			{
				path: 'authentication',
				loadChildren: () =>
					import('./features/authentication/authentication.module').then(m => m.AuthenticationModule),
			},
		],
	},

	{
		path: '**',
		redirectTo: 'authentication/404',
	},
];
