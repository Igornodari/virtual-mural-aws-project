import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsNegotiation: NavCap[] = [
	{
		navCap: 'SIDE_BAR.NEGOTIATION.TITLE',
		can: PERMISSIONS.MENU.BUSINESS,
		items: [
			{
				displayName: 'SIDE_BAR.NEGOTIATION.BUSINESS',
				iconName: 'work',
				route: 'negotiation/business',
			},
			{
				displayName: 'SIDE_BAR.NEGOTIATION.SALES_MIRROR',
				iconName: 'real_estate_agent',
				route: 'negotiation/sales-mirror',
			},
		],
	},
];
