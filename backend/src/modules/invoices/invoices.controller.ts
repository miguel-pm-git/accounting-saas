// src/modules/invoices/invoices.controller.ts

import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';

import { InvoicesService } from './invoices.service.js';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Req() req: any, @Query('overdue') overdue?: string) {
    //console.log('req.user', req.user);

    const companyId = BigInt(req.user.companyId);

    if (overdue === 'true') {
      return this.invoicesService.findOverdue(req.user.companyId);
    }



    return this.invoicesService.findAll(req.user.companyId);
  }

  @Get('subscription/:subscriptionId')
  findBySubscription(
    @Param('subscriptionId')
    subscriptionId: string,
  ) {
    return this.invoicesService.findBySubscription(BigInt(subscriptionId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(BigInt(id));
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.invoicesService.markAsPaid(BigInt(id));
  }
}
