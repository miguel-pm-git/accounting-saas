import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { PaymentsService } from './payments.service.js';

import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('invoice/:invoiceId/charge')
  createCharge(
    @Param('invoiceId')
    invoiceId: string,
  ) {
    return this.paymentsService.createCharge(BigInt(invoiceId));
  }

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(BigInt(id));
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(BigInt(id), dto.transaction_id);
  }
}
