export interface NavItem {
	displayName?: string;
	disabled?: boolean;
	external?: boolean;
	twoLines?: boolean;
	chip?: boolean;
	iconName?: string;
	chipContent?: string;
	chipClass?: string;
	subtext?: string;
	route?: string;
	children?: NavItem[];
	ddType?: string;
	can?: string;
}

export interface NavCap {
	items?: NavItem[];
	navCap: string;
	can?: string;
}
