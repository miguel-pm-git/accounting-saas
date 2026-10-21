import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';

import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory.js';
import { AsaasGateway } from './gateways/asaas.gateway.js';

import { HttpModule } from '@nestjs/axios';
import { TenantModule } from '../../common/tenant/tenant.module.js';

@Module({
  imports: [HttpModule, TenantModule],
  providers: [AsaasGateway, PaymentGatewayFactory, PaymentsService],
  exports: [AsaasGateway],
})
export class PaymentsModule {}
