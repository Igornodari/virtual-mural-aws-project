import { Component, Input, ViewEncapsulation, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  imports: [FormsModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TimePickerComponent,
      multi: true,
    },
  ],
  templateUrl: './time-picker.component.html',
  styles: ``,
})
export class TimePickerComponent implements ControlValueAccessor {
  private _formBuilder = inject(FormBuilder);

  public hours: string[] = [];
  public minutes: string[] = [];
  private minutesFixed: string[] = [];

  public formGroup: FormGroup;
  @Input() min = '00:00';
  @Input() max = '23:59';

  @Input() startHour = 0;
  @Input() endHour = 23;
  @Input()
  disabledHours!: (hour: number) => boolean;

  value!: string;
  disabled = false;
  onChange: any = () => {};
  onTouched: any = () => {};

  get maxHour() {
    if (this.max) {
      const maxSplit = this.max.split(':');
      return maxSplit[0] ? (maxSplit[0].length == 1 ? `0${maxSplit[0]}` : maxSplit[0]) : '23';
    } else {
      return '23';
    }
  }

  getAvailableHours(): number[] {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (!this.disabledHours || !this.disabledHours(i)) {
        hours.push(i);
      }
    }
    return hours;
  }

  get minHour() {
    if (this.min) {
      const minSplit = this.min.split(':');
      return minSplit[0] ? (minSplit[0].length == 1 ? `0${minSplit[0]}` : minSplit[0]) : '00';
    } else {
      return '00';
    }
  }

  get maxMinute() {
    if (this.max) {
      const maxSplit = this.max.split(':');
      return maxSplit[1] ? (maxSplit[1].length == 1 ? `0${maxSplit[1]}` : maxSplit[1]) : '59';
    } else {
      return '59';
    }
  }

  get minMinute() {
    if (this.min) {
      const minSplit = this.min.split(':');
      return minSplit[1] ? (minSplit[1].length == 1 ? `0${minSplit[1]}` : minSplit[1]) : '00';
    } else {
      return '00';
    }
  }

  get maxMinutes() {
    return this.minutes.filter((m) => m <= this.maxMinute);
  }
  get minMinutes() {
    return this.minutes.filter((m) => m >= this.minMinute);
  }

  constructor() {
    this.formGroup = this._formBuilder.nonNullable.group({
      hour: [null, Validators.required],
      minute: [null],
    });
    this.setTime();
  }

  setLimit(value: { min: string; max: string }) {
    this.max = value.max;
    this.min = value.min;

    const previousHour = this.formGroup.controls['hour'].value;
    const previousMinute = this.formGroup.controls['minute'].value;

    this.setTime();

    if (this.hours.includes(previousHour) && this.minutes.includes(previousMinute)) {
      this.formGroup.controls['hour'].setValue(previousHour);
      this.formGroup.controls['minute'].setValue(previousMinute);
    } else {
      this.formGroup.controls['hour'].setValue(this.hours[0]);
      this.formGroup.controls['minute'].setValue(this.minutes[0]);
    }

    this.changeSelect();
  }

  private setTime() {
    const minH = Math.max(this.startHour, Number(this.minHour));
    const maxH = Math.min(this.endHour, Number(this.maxHour));

    let n = minH;

    this.hours = [];
    this.minutes = [];
    this.minutesFixed = [];

    while (n <= maxH) {
      this.hours.push((n < 10 ? '0' : '') + n.toString());
      n++;
    }

    for (let i = 0; i < 60; i++) {
      const time = (i < 10 ? '0' : '') + i.toString();
      this.minutes.push(time);
      this.minutesFixed.push(time);
    }

    this.formGroup.controls['hour'].setValue(this.hours[0]);
    this.changeSelect();
  }

  changeSelect() {
    const hour = this.formGroup.controls['hour'].value;

    if (hour === this.maxHour) {
      this.minutes = this.maxMinutes;
    } else if (hour === this.minHour) {
      this.minutes = this.minMinutes;
      const selectedMinute =
        this.formGroup.controls['minute'].value >= this.minMinute
          ? this.formGroup.controls['minute'].value
          : this.minMinute;
      this.formGroup.controls['minute'].setValue(selectedMinute);
    } else {
      this.minutes = this.minutesFixed;
    }

    this.updateValue();
  }

  updateValue() {
    this.onChange(
      `${this.formGroup.controls['hour'].value ?? '00'}:${
        this.formGroup.controls['minute'].value ?? '00'
      }`,
    );
  }

  setSelected() {
    if (this.value) {
      const split = this.value.split(':');
      this.formGroup.controls['hour'].setValue(split[0]);
      this.formGroup.controls['minute'].setValue(split[1]);
    } else {
      this.formGroup.controls['hour'].setValue('00');
      this.formGroup.controls['minute'].setValue('00');
    }
  }

  writeValue(obj: any): void {
    this.value = obj;

    this.setSelected();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
