import { Admin, Unit } from 'src/app/shared/types';

export type Lead = {
	visibilityIcon: null;
	shareIcon: null;
	id: string;
	createdAt: string;
	updatedAt: string;
	firstName: string;
	lastName: string;
	fullName: string;
	email: string;
	cellphone: string;
	zohoId: string;
	zohoStatus: string;
	leadSource: string;
	score: number;
	status: string;
	unit?: Unit;
	admin?: Admin;
	typology: string;
	category: string;
	birthDate: Date;
	nationality: string;
};
