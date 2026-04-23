export interface Role {
	id: string;
	createdAt: string;
	updatedAt: string;
	name: string;
	label: string;
	permissions: Permission[];
}

export interface Permission {
	active: boolean;
	id: string;
	createdAt: string;
	updatedAt: string;
	name: string;
	label: string;
}
