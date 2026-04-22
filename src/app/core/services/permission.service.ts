import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private _auth = inject(AuthService);


  constructor() {}

  can(permission: string): boolean {
    const user = this._auth.currentUser;

    if (user.groups.some((group) => group.toLowerCase().includes('admin'))) {
      return true;
    }

    return user.permissions.includes(permission);
  }
}
