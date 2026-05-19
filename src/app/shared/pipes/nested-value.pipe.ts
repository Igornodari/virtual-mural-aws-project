import { Pipe, PipeTransform } from '@angular/core';

import { getNestedValue } from '../utils/object-path.util';

@Pipe({
  name: 'nestedValue',
  standalone: true,
})
export class NestedValuePipe implements PipeTransform {
  transform(obj: unknown, path: string, defaultValue: unknown = ''): unknown {
    return getNestedValue(obj, path, defaultValue);
  }
}
