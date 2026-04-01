import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsInteraction: NavCap[] = [
	{
		navCap: 'SIDE_BAR.INTERACTIONS.TITLE',
		can: PERMISSIONS.MENU.INTERACTIONS,
		items: [
			{
				displayName: 'SIDE_BAR.INTERACTIONS.RESERVATIONS',
				iconName: 'chair',
				route: 'interactions',
				can: PERMISSIONS.MENU.SPACES,
				children: [
					{
						displayName: 'SIDE_BAR.INTERACTIONS.SPACES',
						iconName: 'remove',
						route: 'interactions/spaces',
					},
					{
						displayName: 'SIDE_BAR.INTERACTIONS.EVENTS',
						iconName: 'remove',
						route: 'interactions/events',
					},
				],
			},
			{
				displayName: 'SIDE_BAR.INTERACTIONS.VISITS',
				iconName: 'doorbell_3p',
				route: 'interactions/visits',
			},
			{
				displayName: 'SIDE_BAR.INTERACTIONS.FEEDBACK',
				iconName: 'feedback',
				route: 'interactions/feedback',
				can: PERMISSIONS.MENU.FEEDBACK,
			},
			{
				displayName: 'SIDE_BAR.INTERACTIONS.VOUCHERS',
				iconName: 'local_activity',
				route: 'interactions/vouchers',
				can: PERMISSIONS.MENU.VOUCHERS,
			},
		],
	},
];
