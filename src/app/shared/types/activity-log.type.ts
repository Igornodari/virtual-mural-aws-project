import { Admin } from './admin.type';

export interface ActivityLog {
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
}
