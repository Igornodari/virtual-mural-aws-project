import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsSystem: NavCap[] = [
	{
		navCap: 'SIDE_BAR.SYSTEM.TITLE',
		can: PERMISSIONS.SIDE_BAR.SUPER,
		items: [
			{
				displayName: 'SIDE_BAR.SYSTEM.CATEGORIES.TITLE',
				iconName: 'category',
				children: [
					{
						displayName: 'SIDE_BAR.SYSTEM.CATEGORIES.ITEMS',
						iconName: 'remove',
						route: 'system/categories',
					},
					{
						displayName: 'SIDE_BAR.SYSTEM.CATEGORIES.GROUP',
						iconName: 'remove',
						route: 'system/categories/group',
					},
				],
			},

			{
				displayName: 'SIDE_BAR.SYSTEM.PERMISSIONS',
				iconName: 'fingerprint',
				route: 'system/permissions',
			},
			{
				displayName: 'SIDE_BAR.SYSTEM.QUEUE_ERRORS',
				iconName: 'error',
				route: 'system/queue-erros',
			},
		],
	},
];
