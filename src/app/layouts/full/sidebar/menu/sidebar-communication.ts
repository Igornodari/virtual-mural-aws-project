import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsCommunication: NavCap[] = [
	{
		navCap: 'COMMUNICATION.NAVCAP',
		can: PERMISSIONS.MENU.COMMUNICATION,
		items: [
			{
				displayName: 'COMMUNICATION.LINK_GENERATOR.SIDE_BAR',
				iconName: 'link',
				route: 'communication/link-generator',
			},
			{
				displayName: 'COMMUNICATION.SMS.SIDE_BAR',
				iconName: 'message',
				route: 'communication/sms',
			},
			{
				displayName: 'COMMUNICATION.COUPON.SIDE_BAR',
				iconName: 'local_activity',
				route: 'communication/coupon',
			},
		],
	},
];
