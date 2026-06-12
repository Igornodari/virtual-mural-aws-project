import { Pipe, PipeTransform } from '@angular/core';

import { getNestedValue } from '../utils/object-path.util';

@Pipe({
  name: 'appFilter',
  standalone: true,
})
export class FilterPipe implements PipeTransform {
  transform<T>(
    items: readonly T[] | null | undefined,
    searchText: string | null | undefined,
    fields: string | readonly string[] = 'displayName',
  ): T[] {
    if (!items?.length) {
      return [];
    }

    const search = searchText?.toLocaleLowerCase().trim();
    if (!search) {
      return [...items];
    }

    const searchableFields = Array.isArray(fields) ? fields : [fields];

    return items.filter((item) => {
      return searchableFields.some((field) => {
        const value = getNestedValue(item, field, '');
        return String(value).toLocaleLowerCase().includes(search);
      });
    });
  }
}
