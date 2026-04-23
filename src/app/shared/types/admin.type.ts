import { Status } from '.';
import { Condominium } from './condominium.type';
import { Unit } from './unit.type';
import { User } from './user.type';

export interface Admin {
	id: string;
	createdAt: string;
	updatedAt: string;
	zohoId: string;
	status: boolean;
	firstName: string;
	lastName: string;
	fullName: string;
	email: string;
	cpf: string;
	cellphone: string;
	birthDate: string;
	gender: string;
	addressCountry: string;
	addressStreet: string;
	addressNumber: string;
	addressComplement: string;
	addressNeighborhood: string;
	addressCity: string;
	addressState: string;
	addressZipCode: string;
	nationality: string;
	maritalStatus: string;
	document: string;
	condominium?: Condominium;
	// Compatibilidade temporária com código legado.
	unit?: Unit;
	user: User;
	photoUrl: string;
	department: string;
	position: string;
	departmentStyle: Status;
}
