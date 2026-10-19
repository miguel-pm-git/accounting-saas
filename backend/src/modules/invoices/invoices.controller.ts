// src/modules/invoices/invoices.controller.ts

import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';

import { InvoicesService } from './invoices.service.js';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Query('overdue') overdue?: string) {
    if (overdue === 'true') {
      return this.invoicesService.findOverdue();
    }

    return this.invoicesService.findAll();
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
