import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TenantModule } from '../../common/tenant/tenant.module.js';

@Module({
  imports: [TenantModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
