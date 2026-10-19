import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { TenantContext } from '../../../common/tenant/tenant.context.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly tenantContext: TenantContext) {
    super();
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    if (!user.companyId) {
      throw new UnauthorizedException('Tenant não encontrado no token.');
    }

    this.tenantContext.setCompanyId(BigInt(user.companyId));

    return user;
  }
}
