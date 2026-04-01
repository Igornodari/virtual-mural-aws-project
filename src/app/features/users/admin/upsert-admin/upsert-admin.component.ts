import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  Optional
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, map } from 'rxjs';

import BaseComponent from 'src/app/components/base.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AuthService } from 'src/app/services/auth.service';
import { URI_PATH } from 'src/app/shared/constant/path.contant';
import { importBase } from 'src/app/shared/constant/import-base.constant';
import { departmentStyles } from '../admin.const';
import { PERMISSIONS } from 'src/app/shared/constant/permissions.constant';
import { CanPipe } from '../../../../shared/pipe/can.pipe';
import { FormValidators } from '../../../../shared/helpers/form-validator';
import { Admin, Role, Unit } from 'src/app/shared/types';

@Component({
    selector: 'upsert-add-admin',
    templateUrl: './upsert-admin.component.html',
    imports: [...importBase, CanPipe]
})
export class UpsertAdminComponent extends BaseComponent implements AfterViewInit {
  public admin: Admin;
  public roles: Observable<Role[]>;
  public formGroup: FormGroup;
  public action: string = 'Editar usuário';
  public departmentStyles = departmentStyles;
  public PERMISSIONS = PERMISSIONS;
  public isGerente!: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpsertAdminComponent>,
    private cdr: ChangeDetectorRef,
    private snackBarService: SnackBarService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Admin
  ) {
    super();
    this.admin = data;
    this.action = this.admin ? 'Editar usuário' : 'Cadastrar usuário';
    this.formGroup = this.createFormGroup();
    this.roles = this.getRoles();
  }

  ngAfterViewInit() {
    if (this.admin) {
      this.populateForm();
      this.cdr.detectChanges();
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.loading = true;
    const request = this.admin
      ? this.requestService.update<Admin>(URI_PATH.CORE.ADMIN, this.admin.id, this.formGroup.value)
      : this.requestService.post<Admin>(URI_PATH.CORE.ADMIN, this.formGroup.value);

    request.subscribe({
      next: () => {
        this.snackBarService.success('Dados salvos!');
        this.dialogRef.close(true);
      },
      complete: () => this.loading = false,
    });
  }

   createFormGroup(): FormGroup {
    return this.fb.nonNullable.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, FormValidators.cpf]],
      birthDate: ['', [Validators.required, FormValidators.birthDate]],
      addressStreet: ['', Validators.required],
      addressNumber: ['', Validators.required],
      addressCountry: ['', Validators.required],
      addressState: ['', Validators.required],
      addressComplement: [''],
      addressNeighborhood: ['', Validators.required],
      addressCity: ['', Validators.required],
      addressZipCode: ['', Validators.required],
      department: ['', Validators.required],
      position: ['', Validators.required],
      roleId: ['', Validators.required],
      unitId: ['', Validators.required],
      isActive: [true, Validators.required],
    });
  }

   getRoles(): Observable<Role[]> {
    return this.requestService.list<Role>(URI_PATH.CORE.ACL.ROLES).pipe(
      map(res => this.isGerente
        ? res.data.filter(role => ['facilities', 'default', 'front_desk'].includes(role.name))
        : res.data
      )
    );
  }

 populateForm(): void {
    this.formGroup.patchValue({
      fullName: this.admin.fullName,
      email: this.admin.email,
      cpf: this.admin.cpf,
      birthDate: this.admin.birthDate ? this.admin.birthDate.split('T')[0] : '',
      addressStreet: this.admin.addressStreet,
      addressNumber: this.admin.addressNumber,
      addressComplement: this.admin.addressComplement,
      addressState: this.admin.addressState,
      addressNeighborhood: this.admin.addressNeighborhood,
      addressCountry: this.admin.addressCountry,
      addressCity: this.admin.addressCity,
      addressZipCode: this.admin.addressZipCode,
      department: this.admin.department,
      position: this.admin.position,
    });
  }
}
