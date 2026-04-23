import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

import { CUSTOMER_ALL_CATEGORY } from '../../customer.constants';

@Component({
  selector: 'app-customer-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslateModule,
  ],
  templateUrl: './customer-filters.component.html',
  styleUrls: ['./customer-filters.component.scss'],
})
export class CustomerFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('', { nonNullable: true });

  @Input() categories: readonly string[] = [];
  @Input() selectedCategory = CUSTOMER_ALL_CATEGORY;

  @Input()
  set searchTerm(value: string | null | undefined) {
    const nextValue = value ?? '';

    if (nextValue !== this.searchControl.value) {
      this.searchControl.setValue(nextValue, { emitEvent: false });
    }
  }

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.searchTermChange.emit(value));
  }

  selectCategory(category: string): void {
    this.categoryChange.emit(category);
  }

  isAllCategory(category: string): boolean {
    return category === CUSTOMER_ALL_CATEGORY;
  }
}
