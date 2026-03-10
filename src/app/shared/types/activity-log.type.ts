import { Admin } from './admin.type';

export type ActivityLog = {
	id: string;
	createdAt: Date;
	action: string;
	details: string;
	tableId: string;
	table: string;
	admin: Admin;
	user: {
		id: string;
		fullName: string;
		firstName: string;
		photoUrl: string;
	};
};
