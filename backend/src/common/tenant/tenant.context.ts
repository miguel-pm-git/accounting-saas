import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({
  scope: Scope.REQUEST,
})
export class TenantContext {
  constructor(
    @Inject(REQUEST)
    private readonly request: any,
  ) {}

  getCompanyId(): bigint {
    console.log('REQUEST USER =>', this.request?.user);
    console.log('REQUEST =>', Object.keys(this.request ?? {}));

    const companyId = this.request?.user?.companyId;

    if (!companyId) {
      throw new Error('CompanyId not found in request user');
    }

    return BigInt(companyId);
  }
}
