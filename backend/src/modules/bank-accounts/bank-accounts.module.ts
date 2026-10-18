import { Module } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service.js';
import { BankAccountsController } from './bank-accounts.controller.js';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
})
export class BankAccountsModule {}
