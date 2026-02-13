import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { leaveGuard } from './leave-guard';

describe('leaveGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => leaveGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
