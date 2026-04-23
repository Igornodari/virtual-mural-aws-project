import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start as not loading', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should be loading after increment', () => {
    service.increment();
    expect(service.isLoading()).toBe(true);
  });

  it('should not be loading after increment then decrement', () => {
    service.increment();
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });

  it('should remain loading when there are multiple pending requests', () => {
    service.increment();
    service.increment();
    service.decrement();
    expect(service.isLoading()).toBe(true);
  });

  it('should not be loading when all requests complete', () => {
    service.increment();
    service.increment();
    service.decrement();
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });

  it('should not go below 0 with extra decrements', () => {
    service.decrement();
    service.decrement();
    expect(service.isLoading()).toBe(false);
  });

  it('should reset to not loading after reset', () => {
    service.increment();
    service.increment();
    service.reset();
    expect(service.isLoading()).toBe(false);
  });

  it('should resume loading after reset and new increment', () => {
    service.increment();
    service.reset();
    expect(service.isLoading()).toBe(false);
    service.increment();
    expect(service.isLoading()).toBe(true);
  });
});
