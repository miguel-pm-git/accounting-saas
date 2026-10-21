import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CompaniesController } from './companies.controller.js';
import { CompaniesService } from './companies.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

import { AsaasGateway } from '../payments/gateways/asaas.gateway.js';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, AsaasGateway],
})
export class CompaniesModule {}
