import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsFacilities: NavCap[] = [
	{
		navCap: 'SIDE_BAR.FACILITIES.TITLE',
		can: PERMISSIONS.MENU.FACILITIES,
		items: [
			{
				displayName: 'SIDE_BAR.FACILITIES.MAINTENANCES',
				iconName: 'plumbing',
				route: 'facilities/maintenances',
			},
			{
				displayName: 'SIDE_BAR.FACILITIES.AREAS',
				iconName: 'light',
				route: 'facilities/areas',
				can: PERMISSIONS.MENU.AREAS,
			},
		],
	},
];
