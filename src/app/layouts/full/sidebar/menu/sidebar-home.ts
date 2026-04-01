import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsHome: NavCap[] = [
	{
		navCap: 'SIDE_BAR.HOME.TITLE',
		items: [
			{
				displayName: 'SIDE_BAR.HOME.INFORMATION',
				iconName: 'info',
				route: 'units/information/select',
			},
			{
				displayName: 'SIDE_BAR.HOME.APARTMENTS',
				iconName: 'apartment',
				route: 'apartment',
			},
			{
				displayName: 'SIDE_BAR.HOME.TYPOLOGIES',
				iconName: 'category',
				route: 'apartment/typology',
				can: PERMISSIONS.MENU.TYPOLOGY,
			},

			{
				displayName: 'SIDE_BAR.HOME.UNITS',
				iconName: 'holiday_village',
				route: 'units',
				can: PERMISSIONS.MENU.UNITS,
			},
			{
				displayName: 'SIDE_BAR.SYSTEM.USERS.TITLE',
				iconName: 'groups',
				can: PERMISSIONS.MENU.USERS,
				route: 'users',
				children: [
					{
						displayName: 'SIDE_BAR.SYSTEM.USERS.LEADS',
						iconName: 'remove',
						route: 'users/leads',
					},
					{
						displayName: 'SIDE_BAR.SYSTEM.USERS.CLIENTS',
						iconName: 'remove',
						route: 'users/clients',
					},
					{
						displayName: 'SIDE_BAR.SYSTEM.USERS.RESIDENT',
						iconName: 'remove',
						route: 'users/resident',
					},
					{
						displayName: 'SIDE_BAR.SYSTEM.USERS.FINANCIAL_RESPONSIBLE',
						iconName: 'remove',
						route: 'users/financial',
					},
					{
						displayName: 'SIDE_BAR.SYSTEM.USERS.COLLABORATORS',
						iconName: 'remove',
						route: 'users/admin',
					},
				],
			},
		],
	},
];
