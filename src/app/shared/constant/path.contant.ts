export const BRASIL_API = 'https://brasilapi.com.br/api/';

export const URI_PATH = {
	CORE: {
		AUTH: {
			MAIN: 'core/auth',
			DEV: 'core/auth/dev',
			REFRESH: 'core/auth/login/refresh',
			FORGOT_PASSWORD: 'core/auth/forgot-password',
			LOGIN_GOOGLE: 'core/auth/login/google',
		},
		ACL: {
			ROLES: 'core/acl/roles',
			PERMISSIONS: 'core/acl/permissions',
			PERMISSIONS_GROUP: 'core/acl/permissions/group/category',
		},
		PROFILE: {
			MAIN: 'core/auth/profile',
			UPDATE_PASSWORD: 'core/profile/update-password',
			UPDATE_PICTURE: 'core/profile/update-picture',
		},
		OCCUPANCY_MAP: 'core/occupancy/checklist',
		CLIENTS: 'core/clients',
		ADMIN: 'core/admin',
		FINANCIAL_RESPONSIBLE: 'core/financial-responsible',
		SUPPLIERS: 'core/suppliers',
		UNITS: {
			LIST: 'core/units',
			MAIN: 'core/units',
		},
		MAINTENANCE: {
			MAIN: 'core/maintenance',
			ACTION: 'core/maintenance/action',
			REPORT: 'core/maintenance/reports/export',
		},
		PURCHASE_ORDERS: {
			MAIN: 'core/purchase-orders',
			STATUS: 'core/purchase-orders/status',
			EXPORT_XLSX: 'core/purchase-orders/reports/export',
			TAXES: {
				WITH_HELD: 'core/purchase-orders/taxes/withheld',
			},
		},
		CATEGORY: {
			MAIN: 'core/category',
			GROUP: 'core/category/group',
			GROUP_BY_UNIT: 'core/category/group/by-unit',
			SUB_BY_UNIT: 'core/category/sub/by-unit',
		},
		APARTMENTS: {
			MAIN: 'core/apartments',
			FILTERED: 'core/apartments/occupancy/filtered',
			EXPORT_XLSX: 'core/apartments/reports/export',
		},
		TYPOLOGY: {
			MAIN: 'core/typologys',
			ITEMS: 'core/typologys/items',
		},
		SUBSCRIPTION: {
			MAIN: 'core/subscriptions',
			ACTION: 'core/subscriptions/action',
			ITEMS: 'core/subscriptions/items',
			OMIE: 'core/omie/project',
		},
		OCCUPANCY: {
			MAIN: 'core/occupancy',
			SELL: 'core/occupancy/sell',
			CHECKLIST: 'core/occupancy-checklist',
			MOVIN_COUNT: 'core/occupancy/movin/count',
			MOVOUT_COUNT: 'core/occupancy/movout/count',
			EXPORT_XLSX: 'core/occupancy-checklist/reports/export',
			RELOCATION: 'core/occupancy/relocation',
			CHECKOUT: 'core/occupancy/checkout',
			REVERT_CHECKOUT: 'core/occupancy/revert-checkout',
			CHECKIN: 'core/occupancy/checkin',
			CHANGE: 'core/occupancy/change',
			CANCEL: 'core/occupancy/cancel',
		},
		DDD_REFUND: {
			MAIN: 'core/damage-deposit/refund',
			ENTRIES: 'core/damage-deposit/refund/entries',
			REPORTS: { EXPORT: 'core/damage-deposit/refund/reports/export' },
		},
		TICKETS: {
			MAIN: 'core/tickets',
		},
		ACTIVITY_LOG: {
			MAIN: 'core/activity-log',
		},
		BUSINESS: {
			MAIN: 'core/business',
			CHANGE: 'core/business/change',
		},
		FINES: {
			MAIN: 'core/fines',
		},
		INVOICES: {
			LINK_TICKET: 'core/invoices/link-ticket',
			MAIN: 'core/invoices',
			SYNC: 'core/invoices/sync',

			ACTION: 'core/invoices/action',
			CATEGORIES: 'core/category/group',
			REPORTS: { LOTS: 'core/invoices/reports/lots', EXPORT: 'core/invoices/reports/export' },
			IMPORT_ITEMS: 'core/invoices/items/import-sheet',
			ITEMS: 'core/invoices/items',
			DELETE_BATCH: 'core/invoices/delete-batch',
			LAUNCH_BATCH: 'core/invoices/launch-batch',
			LAUNCH: 'core/invoices/launch',
			LAUNCH_INITIAL: 'core/invoices/launch-initial',
		},
		VISITS: {
			MAIN: 'core/visits',
			STATUS: 'core/visits/status',
			STATUS_COUNT: 'core/visits/status/count',
		},
		VISITORS: {
			MAIN: 'core/visitors',
		},
		VOUCHERS: {
			MAIN: 'core/vouchers',
		},
		AREAS: {
			MAIN: 'core/areas',
		},
		SPACES: {
			MAIN: 'core/spaces',
		},
		EVENTS: {
			MAIN: 'core/events',
			INVITATION: 'core/events/invitations',
		},
		INVITATION: {
			MAIN: 'core/invitations',
		},
		FEEDBACK: {
			MAIN: 'core/feedbacks',
		},
		SALES_MIRROR: {
			MAIN: 'core/sales-mirrors',
			GENERATE: 'core/sales-mirrors/generate',
		},
	},
	NOTIFICATIONS: {
		SMS: 'notification/sms',
	},
	INTEROP: {
		LEADS: 'crm-interop/leads',
		LINK_GENERATOR: 'crm-interop/link-generators',
		HOUSING_OPTIONS: {
			MAIN: 'crm-interop/housing-options',
			MATCHING_LEAD: 'crm-interop/housing-options/matching/lead',
		},
		COUPON: {
			MAIN: 'crm-interop/coupon',
		},
	},
	ACTIVITY: {
		QUEUE_ERRORS: {
			MAIN: 'activity/queue-error',
			RETRY: 'activity/queue-error/retry',
		},
	},

	BRASIL_API: {
		CNPJ: 'cnpj/v1/',
		BANKS: 'banks/v1',
		CEP: 'cep/v1/',
	},
};
