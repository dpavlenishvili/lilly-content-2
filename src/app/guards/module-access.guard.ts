import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ModuleAccessService } from '../services/module-access.service';
import { QueryParams } from '../constants/query-params';

export const moduleAccessGuard: CanActivateFn = route => {
  const service = inject(ModuleAccessService);
  const access = route.queryParamMap.get(QueryParams.Access);
  
  access ? service.setAccessFromString(access) : service.clearAccess();
  
  return true;
};
