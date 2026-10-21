import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { TenantModule } from '../../common/tenant/tenant.module.js';

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}