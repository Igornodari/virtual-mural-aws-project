export interface ListResponse<T> {
	data: T[];
	paginate: {
		total: number;
		page: number;
		order: {
			createdAt: string;
		};
		where: [];
	};
}

export interface BanksResponse {
	ispb: string;
	name: string;
	code: number;
	fullName: string;
}
