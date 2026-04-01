import { Routes } from '@angular/router';
import { TableClientsComponent } from './clients/table-clients/table-clients.component';
import { DetailClientsComponent } from './clients/detail-clients/detail-clients.component';
import { CardGridAdminComponent } from './admin/card-grid-admin/card-grid-admin.component';
import { DetailCardGridComponent } from './admin/detail-card-grid/detail-card-grid.component';

export const UsersRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: 'admin',
				component: CardGridAdminComponent,
				data: {
					title: 'HOME.USERS.COLLABORATORS.GRID_ADMIN.TITLE',
				},
			},
			{
				path: 'admin/show/:id',
				component: DetailCardGridComponent,
				data: {
					title: 'Detalhes de Colaboradores',
				},
			},
			{
				path: 'clients',
				component: TableClientsComponent,
				data: {
					title: 'HOME.USERS.CLIENTS.TABLE.TITLE',
				},
			},
			{
				path: 'clients/show/:id',
				component: DetailClientsComponent,
				data: {
					title: 'HOME.USERS.CLIENTS.DETAIL.TITLE',
				},
			},

		],
	},
];
