import { Pipe, PipeTransform } from '@angular/core';

import { ServiceDto } from 'src/app/core/services/service-api.service';
import { CUSTOMER_ALL_CATEGORY } from '../customer.constants';

@Pipe({
  name: 'customerServiceFilter',
  standalone: true,
})
export class CustomerServiceFilterPipe implements PipeTransform {
  transform(
    services: readonly ServiceDto[] | null | undefined,
    searchTerm: string | null | undefined,
    selectedCategory: string | null | undefined,
  ): ServiceDto[] {
    const list = Array.isArray(services) ? services : [];
    const search = this.normalize(searchTerm);
    const category = selectedCategory || CUSTOMER_ALL_CATEGORY;

    return list.filter((service) => {
      const matchesCategory = category === CUSTOMER_ALL_CATEGORY || service.category === category;

      const matchesSearch =
        !search ||
        this.matches(service.name, search) ||
        this.matches(service.description, search) ||
        this.matches(service.category, search);

      return matchesCategory && matchesSearch;
    });
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '').toLocaleLowerCase().trim();
  }

  private matches(value: string | null | undefined, search: string): boolean {
    return this.normalize(value).includes(search);
  }
}
