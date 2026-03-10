export type Role = {
	id: string;
	createdAt: string;
	updatedAt: string;
	name: string;
	label: string;
	permissions: Array<Permission>;
};

export type Permission = {
	active: boolean;
	id: string;
	createdAt: string;
	updatedAt: string;
	name: string;
	label: string;
};
