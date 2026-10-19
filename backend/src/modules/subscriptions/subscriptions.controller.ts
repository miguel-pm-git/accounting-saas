import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { ChangePlanDto } from './dto/change-plan.dto.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto.js';

import { SubscriptionsService } from './subscriptions.service.js';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(BigInt(id));
  }

  @Get('company/:companyId/active')
  getActiveByCompany(
    @Param('companyId', ParseIntPipe)
    companyId: number,
  ) {
    return this.service.getActiveByCompany(BigInt(companyId));
  }

  @Post(':id/change-plan')
  changePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePlanDto,
  ) {
    return this.service.changePlan(BigInt(id), dto);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.service.cancel(BigInt(id), dto);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.service.getHistory(BigInt(id));
  }
}
