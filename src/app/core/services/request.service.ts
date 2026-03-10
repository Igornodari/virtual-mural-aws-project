import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { BRASIL_API } from '../../shared/constant/path.contant';
import { ListResponse, ActivityLog } from '../../shared/types';

type OptionsRequest = { api?: 'CORE' | 'BRASIL_API'; search?: any; params?: any; relations?: any };

@Injectable({
	providedIn: 'root',
})
export class RequestService {
	private API = environment.apiBaseUrl;
	private apis = { CORE: environment.apiBaseUrl, BRASIL_API: BRASIL_API };

	constructor(private http: HttpClient) {}

	get<T>(
		path: string,
		options: OptionsRequest = {
			api: 'CORE',
			search: {},
			params: {},
			relations: {},
		}
	) {
		const search = Object.keys(options.search ?? {}).length
			? { search: JSON.stringify(options.search) }
			: null;

		const relations = Object.keys(options?.relations ?? {}).length
			? { relations: JSON.stringify(options?.relations) }
			: null;

		return this.http.get<T>(this.apis[options.api ?? 'CORE'] + path, {
			params: { ...search, ...options?.params, ...relations },
		});
	}

	list<T>(path: string, options?: { search?: any; params?: any; relations?: any }) {
		const search = Object.keys(options?.search ?? {}).length
			? { search: JSON.stringify(options?.search) }
			: null;
		const relations = Object.keys(options?.relations ?? {}).length
			? { relations: JSON.stringify(options?.relations) }
			: null;
		return this.http.get<ListResponse<T>>(`${this.API}${path}`, {
			params: { ...search, ...relations, ...options?.params },
		});
	}

	show<T>(path: string, id: string, options?: { params?: any }) {
		return this.http.get<T>(`${this.API}${path}/${id}`, {
			params: { ...options?.params },
		});
	}

	update<T>(
		path: string,
		id: string,
		payload: Partial<T>,
		options?: { type: 'multipart/form-data' }
	) {
		let data: FormData | Partial<T> = payload;
		if (options?.type == 'multipart/form-data') {
			data = this.multipartFormData(payload);
		}
		return this.http.put<any>(`${this.API}${path}/${id}`, data);
	}

	patch<T>(path: string, id: string, payload: Partial<T>, options?: { params?: any }) {
		return this.http.patch<T>(`${this.API}${path}/${id}`, payload, {
			params: { ...options?.params },
		});
	}

	post<T>(path: string, payload: T, options?: { type: 'multipart/form-data' }) {
		let data: FormData | T = payload;
		if (options?.type == 'multipart/form-data') {
			data = this.multipartFormData(payload);
		}

		return this.http.post<any>(`${this.API}${path}`, data);
	}

	delete(path: string, id: string, body?: any) {
		return this.http.delete<any>(`${this.API}${path}/${id}`, body);
	}

	download(path: string) {
		return this.http.get(`${this.API}${path}`, { responseType: 'blob' });
	}

	getActivities(path: string, id: any, option = { visibility: ['public', 'internal'] }) {
		return this.http
			.get<ListResponse<ActivityLog>>(`${this.apis['CORE']}core/activity-log`, {
				params: {
					search: JSON.stringify({
						tableId: id,
						table: path,
						visibility: ['in', option.visibility],
					}),
				},
			})
			.pipe(map(data => data.data));
	}

	private multipartFormData(data: any): FormData {
		const payload = new FormData();
		for (const key in data) {
			if (typeof data[key] == 'boolean') {
				data[key] = data[key] == true ? 1 : 0;
			}
			if (data[key]) {
				payload.append(key, data[key]);
			}
		}
		return payload;
	}
}
