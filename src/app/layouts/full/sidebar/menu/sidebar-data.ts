import { NavCap } from '../nav-item/nav-item';
import { navItemsHome } from './sidebar-home';
import { navItemsOccupationMap } from './sidebar-occupation-map';
import { navItemsFinance } from './sidebar-finance';
import { navItemsReport } from './sidebar-report';
import { navItemsInteraction } from './sidebar-interaction';
import { navItemsSystem } from './sidebar-system';
import { navItemsFacilities } from './sidebar-facilities';
import { navItemsNegotiation } from './sidebar-negotiation';
import { navItemsCommunication } from './sidebar-communication';

export const navItems: NavCap[] = [
	...navItemsHome,
	...navItemsOccupationMap,
	...navItemsFinance,
	...navItemsFacilities,
	...navItemsNegotiation,
	...navItemsInteraction,
	...navItemsCommunication,
	...navItemsReport,
	...navItemsSystem,
];
