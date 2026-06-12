import { CustomerServiceFilterPipe } from './customer-service-filter.pipe';
import { ServiceDto } from 'src/app/core/services/service-api.service';
import { CUSTOMER_ALL_CATEGORY } from '../customer.constants';

const makeService = (overrides: Partial<ServiceDto> = {}): ServiceDto =>
  ({
    id: 'svc-1',
    name: 'Pintura',
    description: 'Pintura residencial',
    category: 'MAINTENANCE',
    isActive: true,
    ...overrides,
  }) as ServiceDto;

describe('CustomerServiceFilterPipe', () => {
  let pipe: CustomerServiceFilterPipe;

  beforeEach(() => {
    pipe = new CustomerServiceFilterPipe();
  });

  it('deve retornar array vazio para null', () => {
    expect(pipe.transform(null, '', CUSTOMER_ALL_CATEGORY)).toEqual([]);
  });

  it('deve retornar todos os serviços sem filtros', () => {
    const services = [makeService(), makeService({ id: 'svc-2', name: 'Limpeza' })];
    const result = pipe.transform(services, '', CUSTOMER_ALL_CATEGORY);
    expect(result).toHaveLength(2);
  });

  it('deve filtrar por categoria', () => {
    const services = [
      makeService({ category: 'MAINTENANCE' }),
      makeService({ id: 'svc-2', category: 'CLEANING' }),
    ];
    const result = pipe.transform(services, '', 'MAINTENANCE');
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('MAINTENANCE');
  });

  it('deve filtrar por termo de busca no nome', () => {
    const services = [
      makeService({ name: 'Pintura Residencial' }),
      makeService({ id: 'svc-2', name: 'Limpeza Geral', description: 'Limpeza geral' }),
    ];
    const result = pipe.transform(services, 'pintura', CUSTOMER_ALL_CATEGORY);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pintura Residencial');
  });

  it('deve filtrar por termo de busca na descrição', () => {
    const services = [makeService({ description: 'Serviço especial de acabamento' })];
    const result = pipe.transform(services, 'acabamento', CUSTOMER_ALL_CATEGORY);
    expect(result).toHaveLength(1);
  });

  it('deve ser case-insensitive na busca', () => {
    const services = [makeService({ name: 'PINTURA' })];
    expect(pipe.transform(services, 'pintura', CUSTOMER_ALL_CATEGORY)).toHaveLength(1);
    expect(pipe.transform(services, 'PINTURA', CUSTOMER_ALL_CATEGORY)).toHaveLength(1);
  });

  it('deve combinar filtro de categoria e busca', () => {
    const services = [
      makeService({ name: 'Pintura', category: 'MAINTENANCE' }),
      makeService({ id: 'svc-2', name: 'Pintura', category: 'CLEANING' }),
    ];
    const result = pipe.transform(services, 'pintura', 'MAINTENANCE');
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('MAINTENANCE');
  });

  it('deve retornar vazio quando não há correspondência', () => {
    const services = [makeService({ name: 'Pintura' })];
    expect(pipe.transform(services, 'eletrica', CUSTOMER_ALL_CATEGORY)).toHaveLength(0);
  });

  it('deve ignorar searchTerm null ou undefined', () => {
    const services = [makeService(), makeService({ id: 'svc-2' })];
    expect(pipe.transform(services, null, CUSTOMER_ALL_CATEGORY)).toHaveLength(2);
    expect(pipe.transform(services, undefined, CUSTOMER_ALL_CATEGORY)).toHaveLength(2);
  });
});
