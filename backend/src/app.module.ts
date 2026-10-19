import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CompaniesModule } from './modules/companies/companies.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { SuppliersModule } from './modules/suppliers/suppliers.module.js';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module.js';
import { ChartAccountsModule } from './modules/chart-accounts/chart-accounts.module.js';
import { ReceivablesModule } from './modules/receivables/receivables.module.js';
import { PayablesModule } from './modules/payables/payables.module.js';
import { CashMovementsModule } from './modules/cash-movements/cash-movements.module.js';
import { JournalEntriesModule } from './modules/journal-entries/journal-entries.module.js';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ChartPlansModule } from './modules/chart-plans/chart-plans.module.js';
import { ChartAccountTemplatesModule } from './modules/chart-account-templates/chart-account-templates.module.js';
import { CompanyAccountsModule } from './modules/company-accounts/company-accounts.module.js';
import { LedgerMovementsModule } from './modules/ledger-movements/ledger-movements.module.js';
import { JournalReversalsModule } from './modules/journal-reversals/journal-reversals.module.js';
import { TenantModule } from './common/tenant/tenant.module.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor.js';
import jwtConfig from './config/jwt.config.js';
import { PlansModule } from './modules/plans/plans.module.js';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module.js';
import { InvoicesModule } from './modules/invoices/invoices.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingModule } from './modules/billing/billing.module.js';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    UsersModule,
    CompaniesModule,
    CustomersModule,
    SuppliersModule,
    BankAccountsModule,
    ChartAccountsModule,
    ReceivablesModule,
    PayablesModule,
    CashMovementsModule,
    JournalEntriesModule,
    AuditLogsModule,
    PrismaModule,
    ChartPlansModule,
    ChartAccountTemplatesModule,
    CompanyAccountsModule,
    LedgerMovementsModule,
    JournalReversalsModule,
    TenantModule,
    PlansModule,
    SubscriptionsModule,
    InvoicesModule,
    PaymentsModule,
    ScheduleModule.forRoot(),
    BillingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule {}
