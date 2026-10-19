import { TenantContext } from '../tenant/tenant.context.js';

export abstract class TenantBaseService {
  constructor(protected readonly tenantContext: TenantContext) {}

  protected getCompanyId(): bigint {
    return this.tenantContext.getCompanyId();
  }

  protected tenantWhere(where: Record<string, any> = {}) {
    return {
      ...where,
      company_id: this.getCompanyId(),
    };
  }
}
