export const PERMISSIONS = {
	MENU: {
		SELECT_UNIT: 'menu_select_unit',
		SELECT_ALL_UNIT: 'menu_select_all_unit',
		USERS: 'menu_users',
		BILL_TO_RECEIVE: 'menu_bill_to_receive',
		BILL_TO_PAY: 'menu_bill_to_pay',
		QUEUE: 'menu_queue-errors',
		INTERACTIONS: 'menu_interactions',
		VOUCHERS: 'menu_vouchers',
		BUSINESS: 'menu_business',
		FINANCE: 'menu_financial',
		SUPORT: 'menu_suport',
		FEEDBACK: 'menu_feedback',
		UNITS: 'menu_units',
		TYPOLOGY: 'menu_typology',
		STUDIES_AND_ANALYSES: 'menu_studies_analyses',
		FACILITIES: 'menu_facilities',
		STANDARDIZATIONS: 'menu_standardizations',
		REPORTS: 'menu_reports',
		REVENUE: 'menu_revenue',
		PLANNING: 'menu_fp&a',
		COMMERCIAL: 'menu_commercial',
		AREAS: 'menu_areas',
		SPACES: 'menu_spaces',
		INSPECTION: 'menu_inspection',
		OPERATIONAL: 'menu_operational',
		RESERVATIONS: 'menu_reservations',
		INVOICES_INTIAL: 'menu_invoices_initial',
		COMMUNICATION: 'menu_communication',
		CHECK_LIST: 'menu_check_list',
	},
	APARTMENTS: {
		LIST_APARTMENT: {
			CREATE_ACTION: 'list_apartment_create',
		},
	},
	CHECK_LIST: {
		MOVE_OUT: {
			DETAIL: {
				SCHEDULE_ACTION: 'schedule_action',
			}
		}
	},
	OCCUPANCY: {
		DETAIL: {
			OCCUPANCY_ACTIONS: 'occupancy_actions',
			REVERT_CHECKOUT_ACTION: 'occupancy_action_revert',
			DONE_ACTION: 'occupancy_detail_done',
			CANCEL: 'occupancy_cancel',
		},
	},
	SALES_MIRROR: {
		TABLE_SALES_MIRROR: {
			GENERATE_SALES_MIRROR_ACTION: 'sales_mirror_table_generate',
		},
	},
	DAMAGE_DEPOSIT_REFUND: {
		DETAIL_DAMAGE_DEPOSIT_REFUND: {
			DDD_COMPLETE_ACTION: 'ddd_complete',
		},
	},
	PURCHASE_ORDER: {
		DETAIL_PURCHASE_ORDER: {
			SEND_ORDER_ACTION: 'send_order',
			APPROVE_ORDER_ACTION: 'approve_order',
			REPROVE_ORDER_ACTION: 'reprove_order',
			CANCEL_ORDER_ACTION: 'cancel_order',
		},
		CREATE_PURCHASE_ORDER: {
			SHOW_PERSONAL_SELECT_ITEM: 'show_personal_option',
			PRIVATE_CATEGORY: 'show_private_categories',
		},
	},
	SIDE_BAR: {
		SUPER: 'super',
	},
	INVOICING: {
		DETAIL_INVOICING: {
			DELETE_ENTRIES_ACTION: 'invoicing_detail_delete',
			CANCEL_ENTRIES_ACTION: 'invoicing_detail_cancel',
			ADD_ENTRIES_ACTION: 'invoicing_crud_entries',
			SEND_INVOICING_ACTION: 'invoicing_buttom_send',
		},
	},
	INVOICES_INITIAL: {
		EDIT: 'invoices_initial_edit',
		BUTTOM_SEND_ACTION: 'invoices_initial_buttom_send',
	},
	SUBSCRIPTION: {
		DETAIL_SUBSCRIPTION: {
			CRUD_ENTRIES: 'subscription_crud_entries',
			EDIT_ENTRIES_ACTION: 'subscription_edit',
		},
	},
	ADMIN: {
		UPSERT: 'admin_users_upsert',
	},
};
