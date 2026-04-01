import { Status } from 'src/app/shared/types';
import { AdminDepartmentEnum } from './admin.enum';

export const departmentStyles: Status[] = [
	{ label: 'Facilites', style: 'success', name: AdminDepartmentEnum.FACILITIES },
	{ label: 'Comercial', style: 'success', name: AdminDepartmentEnum.COMMERCIAL },
	{ label: 'T.I', style: 'success', name: AdminDepartmentEnum.INFORMATION_TECHNOLOGY },
	{ label: 'Operação', style: 'success', name: AdminDepartmentEnum.OPERATION },
	{ label: 'Financeiro', style: 'success', name: AdminDepartmentEnum.FINANCIAL },
	{ label: 'Recursos humanos', style: 'success', name: AdminDepartmentEnum.HUMAN_RESOURCES },
	{ label: 'Marketing', style: 'success', name: AdminDepartmentEnum.MARKETING },
];
