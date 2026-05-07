import { Pipe, PipeTransform } from '@angular/core';
import { getCategoryI18nKey } from '../constant/categories.constants';

/**
 * Converte o valor cru de uma categoria (ex.: 'Manutenção') na chave de
 * tradução correspondente (ex.: 'CATEGORY.MAINTENANCE'). Use sempre
 * combinado com o pipe `translate` do ngx-translate:
 *
 *   {{ service.category | categoryLabel | translate }}
 */
@Pipe({
  name: 'categoryLabel',
  standalone: true,
  pure: true,
})
export class CategoryLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return getCategoryI18nKey(value);
  }
}
