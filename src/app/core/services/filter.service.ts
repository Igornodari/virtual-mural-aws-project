import { Injectable } from '@angular/core';

export type Filter = {
	formValue?: any;
	search?: any;
	name: string;
	page?: number;
	skip?: number;
	pageSize?: number;
	totalPage?: number;
	sort?: string;
};

@Injectable({
	providedIn: 'root',
})
export class FilterService {
	public data: Array<Filter> = [];

	constructor() {}

	set(filter: Filter) {
		const index = this.data.findIndex(data => data.name == filter.name);

		if (index >= 0) {
			this.data[index].formValue = filter.formValue ?? this.data[index].formValue;
			this.data[index].search = filter.search ?? this.data[index].search;
			this.data[index].page = filter.page ?? this.data[index].page;
			this.data[index].pageSize = filter.pageSize ?? this.data[index].pageSize;
			this.data[index].skip = filter.skip ?? this.data[index].skip;
			this.data[index].sort = filter.sort ?? this.data[index].sort;
		} else {
			this.data.push(filter);
		}

		return filter;
	}

	update(filter: string, parans: { name: string; value: any }) {
		const index = this.data.findIndex(data => data.name == filter);

		if (index >= 0) {
			if (
				parans.name == 'page' ||
				parans.name == 'skip' ||
				parans.name == 'pageSize' ||
				parans.name == 'totalPage'
			) {
				this.data[index][parans.name] = parans.value;
			}
		}
	}

	get(name: string) {
		const filter = this.data.find(filter => filter.name == name);
		if (!filter) {
			return this.set({
				formValue: {},
				search: {},
				name,
				page: 0,
				skip: 0,
				pageSize: undefined,
				totalPage: 0,
			});
		}
		return filter;
	}

	clear(name: string) {
		const index = this.data.findIndex(filter => filter.name == name);
		if (index >= 0) {
			for (const key in this.data[index].search) {
				this.data[index].search[key] = undefined;
			}
			this.data[index].formValue = {};
			return this.data[index];
		} else {
			return { formValue: {}, search: {}, name };
		}
	}

	getValueSearch(operator: string, value: any) {
		let valueSerach;

		if (!value || value.length == 0) {
			return undefined;
		}

		if (operator === 'in') {
			valueSerach = [operator, [value]];
		} else if (operator === 'equal') {
			valueSerach = value;
		} else if (operator === 'between') {
			valueSerach = [operator, value[0], value[1]];
		} else {
			valueSerach = [operator, value];
		}

		return valueSerach;
	}

	filtered(name: string) {
		const values = this.get(name).formValue;
		const filtered = [];
		for (const key in values) {
			if (values[key] || values[key] === 0 || values[key] === false) {
				filtered.push(key);
			}
		}

		return filtered;
	}

	filteredCount(name: string) {
		const filter = this.filtered(name).length;
		return filter > 0 ? filter : null;
	}
}
