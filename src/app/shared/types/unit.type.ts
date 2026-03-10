import { Status } from './index';

export type Unit = {
	id: string;
	createdAt: string;
	updatedAt: string;
	name: string;
	hotelCode: number;
	address: string;
	isActive: boolean;
	zohoId: string;
	statusStyle: Status;
	waPhoneNumber: string;
	closure: string;
	opening: string;
	regulationUrl: string;
	addressStreet: string;
	addressNumber?: string;
	addressCity?: string;
	addressNeighborhood?: string;
	addressZipCode?: string;
	addressState?: string;
	latitude?: number;
	longitude?: number;
};
