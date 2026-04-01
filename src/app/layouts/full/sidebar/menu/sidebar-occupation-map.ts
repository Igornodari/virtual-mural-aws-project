import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsOccupationMap: NavCap[] = [
	{
		navCap: 'OCCUPANCY_MAP.NAVCAP',
		items: [
			{
				displayName: 'SIDE_BAR.HOME.OCCUPANCY_MAP.OCCUPATIONS',
				iconName: 'room_service',
				route: 'occupancy',
			},
			{
				displayName: 'SIDE_BAR.HOME.OCCUPANCY_MAP.INSPECTION.TITLE',
				iconName: 'visibility',
				route: 'facilities',
				can: PERMISSIONS.MENU.INSPECTION,
				children: [
					{
						displayName: 'SIDE_BAR.HOME.OCCUPANCY_MAP.INSPECTION.MOVE_IN',
						iconName: 'remove',
						route: 'facilities/inspections/move-in',
					},
					{
						displayName: 'SIDE_BAR.HOME.OCCUPANCY_MAP.INSPECTION.MOVE_OUT',
						iconName: 'remove',
						route: 'facilities/inspections/move-out',
					},
				],
			},
			{
				displayName: 'OCCUPANCY_MAP.CHECK_LIST.NAVCAP',
				iconName: 'check_circle',
				route: 'checklist',
				can: PERMISSIONS.MENU.CHECK_LIST,
				children: [
					{
						displayName: 'OCCUPANCY_MAP.CHECK_LIST.MOVIN.SIDE_BAR',
						iconName: 'remove',
						route: 'checklist/check-in',
					},
					{
						displayName: 'OCCUPANCY_MAP.CHECK_LIST.MOVOUT.SIDE_BAR',
						iconName: 'remove',
						route: 'checklist/check-out',
					},
				],
			},
		],
	},
];
