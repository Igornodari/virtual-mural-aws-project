import { ChangeDetectorRef, Component, inject, AfterViewInit } from '@angular/core';
import BaseComponent from './base.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FilterService } from '../core/services/filter.service';

@Component({
  standalone: true,
  selector: 'app-base-filter',
  template: '',
})
export default class BaseFilterComponent<T> extends BaseComponent implements AfterViewInit {
  dataChild = inject(MAT_DIALOG_DATA);

  public formGroup!: FormGroup;
  public filterService: FilterService;
  public dialogRef: MatDialogRef<T>;
  protected _formBuilder: FormBuilder;
  protected _cdr: ChangeDetectorRef;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    super();
    this.filterService = inject(FilterService);
    this.dialogRef = inject(MatDialogRef<T>);
    this._formBuilder = inject(FormBuilder);
    this._cdr = inject(ChangeDetectorRef);
  }

  get fc() {
    return this.formGroup.controls;
  }
  ngAfterViewInit(): void {
    this.formGroup.patchValue(this.filterService.get(this.dataChild.name).formValue);
    this._cdr.detectChanges();
  }

  clear() {
    this.formGroup.reset();
    this.searchParams = {};

    this.dialogRef.close(this.filterService.clear(this.dataChild.name).search);
  }

  setQuery(name: string, operator: string, value: any) {
    const spliName = name.split('.');

    if (spliName[1] && operator == 'equal') {
      name = spliName[0];
      this.searchParams[spliName[0]] = {
        [spliName[1]]: this.filterService.getValueSearch(operator, value),
      };
    } else {
      this.searchParams[name] = this.filterService.getValueSearch(operator, value);
    }

    if (!this.searchParams[name]) {
      this.formGroup.controls[name]?.setValue(undefined);
    }
  }
  setSearch() {
    for (const key in this.formGroup.value) {
      this.searchParams[key] = this.formGroup.value[key] ?? '';
    }
  }

  onConfirm() {
    this.setSearch();

    this.filterService.set({
      name: this.dataChild.name,
      search: this.searchParams,
      formValue: this.formGroup.value,
    });
    this.dialogRef.close(this.searchParams);
    return;
  }
}
