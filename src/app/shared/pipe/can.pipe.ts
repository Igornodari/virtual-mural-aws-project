import { Pipe, PipeTransform } from '@angular/core';
import { PermissionService } from 'src/app/services/permission.service';

@Pipe({
	standalone: true,
	name: 'can',
})
export class CanPipe implements PipeTransform {
	constructor(private _permissionService: PermissionService) {}

	transform(permission: string): unknown {
		return this._permissionService.can(permission);
	}
}
