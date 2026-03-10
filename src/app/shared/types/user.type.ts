import { Role } from './acl.type';
import { Unit } from './unit.type';

export interface User {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	fullName: string;
	email: string;
	isActive: boolean;
	photoPath: string;
	photoUrl: string;
	firstName: string;
	lastName: string;
	profileId: string;
	role: Role;
	unit: Unit;
}
