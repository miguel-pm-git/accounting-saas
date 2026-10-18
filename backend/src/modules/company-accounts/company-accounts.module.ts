import { Module } from '@nestjs/common';
import { CompanyAccountsService } from './company-accounts.service.js';
import { CompanyAccountsController } from './company-accounts.controller.js';

@Module({
  providers: [CompanyAccountsService],
  controllers: [CompanyAccountsController]
})
export class CompanyAccountsModule {}
