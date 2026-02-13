import { CanActivateFn } from '@angular/router';

export const leaveGuard: CanActivateFn = (route, state) => {
  return true;
};
