import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root',
})
export class PermissionService {
	constructor(private _auth: AuthService) {}

	can(permission: string): boolean {
		const user = this._auth.currentUser;

		if (user.role?.name === 'admin') {
			return true;
		}

		const permissions = user.role.permissions;
		return permissions.some(({ name }) => name === permission);
	}
}
