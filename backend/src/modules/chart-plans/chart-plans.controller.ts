import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { ChartPlansService } from './chart-plans.service.js';

import { CreateChartPlanDto } from './dto/create-chart-plan.dto.js';
import { UpdateChartPlanDto } from './dto/update-chart-plan.dto.js';

@Controller('chart-plans')
@UseGuards(JwtAuthGuard)
export class ChartPlansController {
  constructor(private readonly service: ChartPlansService) {}

  @Post()
  create(@Body() dto: CreateChartPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(BigInt(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChartPlanDto) {
    return this.service.update(BigInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(BigInt(id));
  }

  @Post(':id/init-company/:companyId')
  initializeCompanyAccounts(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
  ) {
    return this.service.initializeCompanyAccounts(
      BigInt(id),
      BigInt(companyId),
    );
  }
}
