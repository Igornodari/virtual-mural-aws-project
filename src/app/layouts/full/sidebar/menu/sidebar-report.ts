import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { NavCap } from '../nav-item/nav-item';

export const navItemsReport: NavCap[] = [
	{
		navCap: 'SIDE_BAR.REPORTS.TITLE',
		can: PERMISSIONS.MENU.REPORTS,
		items: [
			{
				displayName: 'SIDE_BAR.REPORTS.STUDIES_AND_FACILITIES.TITLE',
				iconName: 'analytics',
				route: 'studies',
				can: PERMISSIONS.MENU.STUDIES_AND_ANALYSES,
				children: [
					{
						displayName: 'SIDE_BAR.REPORTS.STUDIES_AND_FACILITIES.FOREIGN_ANALYSIS.TITLE',
						iconName: 'remove',
						route: 'reports/foreign-analysis',
					},
					{
						displayName: 'SIDE_BAR.REPORTS.STUDIES_AND_FACILITIES.CLIENTS_MAPPING.TITLE',
						iconName: 'remove',
						route: 'reports/clients-mapping',
					},
					{
						displayName: 'Relatório de Tendências',
						iconName: 'remove',
						route: 'reports/report-tendencies',
					},

					{
						displayName: 'SIDE_BAR.REPORTS.STUDIES_AND_FACILITIES.EVENTS_DISCLOSURE.TITLE',
						iconName: 'remove',
						route: 'reports/events-disclosure',
					},
					{
						displayName: 'SIDE_BAR.REPORTS.STUDIES_AND_FACILITIES.SURVEY_AND_OFFER.TITLE',
						iconName: 'remove',
						route: 'reports/survey-and-offer',
					},
					{
						displayName: 'SIDE_BAR.REPORTS.STUDIES_AND_FACILITIES.PARTNERSHIP_OPPORTUNITIES.TITLE',
						iconName: 'remove',
						route: 'reports/partnership-opportunities',
					},
				],
			},
			{
				displayName: 'SIDE_BAR.REPORTS.OPERATIONAL.TITLE',
				iconName: 'engineering',
				route: 'operational',
				can: PERMISSIONS.MENU.OPERATIONAL,
				children: [
					{
						displayName: 'SIDE_BAR.REPORTS.OPERATIONAL.REPORTS_CANCEL',
						iconName: 'summarize',
						route: 'reports/cancel-contract',
					},
					{
						displayName: 'SIDE_BAR.REPORTS.OPERATIONAL.RENEWAL',
						iconName: 'summarize',
						route: 'reports/renewal',
					},
				],
			},

			{
				displayName: 'SIDE_BAR.REPORTS.COMMERCIAL.TITLE',
				iconName: 'business',
				route: 'commercial',
				children: [
					{
						displayName: 'SIDE_BAR.REPORTS.COMMERCIAL.SALMON_RUN.TITLE',
						iconName: 'phishing',
						route: 'reports/salmon-run',
					},
					// {
					// 	displayName: 'Lead Score',
					// 	iconName: 'remove',
					// 	route: 'reports/lead-score',
					// },
					{
						displayName: 'Lead Score - funil',
						iconName: 'remove',
						route: 'reports/lead-score-funil',
					},
					{
						displayName: 'Lead Score - contratos',
						iconName: 'remove',
						route: 'reports/lead-score-contracts',
					},
				],
			},

			{
				displayName: 'SIDE_BAR.REPORTS.FINANCIAL.TITLE',
				iconName: 'attach_money',
				route: 'financial',
				can: PERMISSIONS.MENU.FINANCE,
				children: [
					{
						displayName: 'SIDE_BAR.REPORTS.FINANCIAL.ACCOUNT_RECEIVABLE.REVENUE',
						iconName: 'receipt',
						can: PERMISSIONS.MENU.REVENUE,
						route: 'reports/account-receivable',
					},
				],
			},
			{
				displayName: 'SIDE_BAR.REPORTS.FINANCIAL.FP&A.TITLE',
				iconName: 'bar_chart',
				can: PERMISSIONS.MENU.PLANNING,
				route: 'reports/fp&a-report',
			},
			{
				displayName: 'SIDE_BAR.REPORTS.RECYCLING.TITLE',
				iconName: 'recycling',
				can: PERMISSIONS.MENU.COMMERCIAL,
				route: 'reports/visits-discart-occupation',
			},
			{
				displayName: 'SIDE_BAR.REPORTS.MAINTENANCE_AND_INFRA.TITLE',
				iconName: 'build',
				can: PERMISSIONS.MENU.FACILITIES,
				route: 'reports/management-maintenance',
				children: [
					{
						displayName: 'SIDE_BAR.REPORTS.MAINTENANCE_AND_INFRA.VISUAL_MANAGER.TITLE',
						iconName: 'dashboard',
						route: 'reports/visual-manager',
					},
				],
			},
			{
				displayName: 'SIDE_BAR.REPORTS.STANDARDIZATION.NAMES_STANDARDIZATION.TITLE',
				iconName: 'checklist',
				can: PERMISSIONS.MENU.STANDARDIZATIONS,
				route: 'reports/standardizations-names',
			},
		],
	},
];
