import { Injectable, Scope } from '@nestjs/common';

@Injectable({
  scope: Scope.REQUEST,
})
export class TenantContext {
  private companyId: bigint | null = null;

  setCompanyId(companyId: bigint): void {
    this.companyId = companyId;
  }

  getCompanyId(): bigint {
    if (!this.companyId) {
      throw new Error(
        'TenantContext: companyId não definido para a requisição atual',
      );
    }

    return this.companyId;
  }

  hasCompany(): boolean {
    return this.companyId !== null;
  }
}
