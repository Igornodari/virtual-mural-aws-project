import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsFinance: NavCap[] = [
	{
		navCap: 'SIDE_BAR.FINANCE.TITLE',
		can: PERMISSIONS.MENU.FINANCE,
		items: [
			{
				displayName: 'SIDE_BAR.FINANCE.BILLS_TO_PAY.TITLE',
				iconName: 'point_of_sale',
				route: 'bills-to-pay',
				children: [
					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_PAY.PURCHASE_ORDER',
						iconName: 'remove',
						route: 'bills-to-pay/purchase-order',
					},
					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_PAY.SUPPLIERS',
						iconName: 'remove',
						route: 'bills-to-pay/suppliers',
					},
					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_PAY.DAMAGE_DEPOSIT_REFUND',
						iconName: 'remove',
						route: 'bills-to-pay/ddd',
					},
				],
			},
			{
				displayName: 'SIDE_BAR.FINANCE.BILLS_TO_RECEIVE.TITLE',
				iconName: 'account_balance_wallet',
				route: 'bills-to-receive',
				can: PERMISSIONS.MENU.BILL_TO_RECEIVE,
				children: [
					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_RECEIVE.SUBSCRIPTIONS',
						iconName: 'remove',
						route: 'bills-to-receive/subscription',
					},
					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_RECEIVE.INVOICES_INITIAL',
						iconName: 'remove',
						route: 'bills-to-receive/invoices-initial',
						can: PERMISSIONS.MENU.INVOICES_INTIAL,
					},
					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_RECEIVE.INVOICING',
						iconName: 'remove',
						route: 'bills-to-receive/invoicing',
					},

					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_RECEIVE.INVOICES',
						iconName: 'remove',
						route: 'bills-to-receive/invoices',
					},
					{
						displayName: 'SIDE_BAR.FINANCE.BILLS_TO_RECEIVE.INVOICES_SINGLE',
						iconName: 'remove',
						route: 'bills-to-receive/invoices-single',
					},
				],
			},
			{
				displayName: 'SIDE_BAR.FINANCE.FINES',
				iconName: 'assignment_late',
				can: 'menu_fines',
				route: 'fines',
			},
		],
	},
];
