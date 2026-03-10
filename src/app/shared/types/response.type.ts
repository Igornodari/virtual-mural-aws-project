export type ListResponse<T> = {
	data: T[];
	paginate: {
		total: number;
		page: number;
		order: {
			createdAt: string;
		};
		where: [];
	};
};

export type BanksResponse = {
	ispb: string;
	name: string;
	code: number;
	fullName: string;
};
