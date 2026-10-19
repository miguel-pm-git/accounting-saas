import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ChartAccountsService } from './chart-accounts.service.js';

import { CreateChartAccountDto } from './dto/create-chart-account.dto.js';
import { UpdateChartAccountDto } from './dto/update-chart-account.dto.js';

@Controller('chart-accounts')
export class ChartAccountsController {
  constructor(private readonly chartAccountsService: ChartAccountsService) {}

  @Post()
  create(@Body() dto: CreateChartAccountDto) {
    return this.chartAccountsService.create(dto);
  }

  @Get()
  findAll() {
    return this.chartAccountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chartAccountsService.findOne(BigInt(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChartAccountDto) {
    return this.chartAccountsService.update(BigInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chartAccountsService.remove(BigInt(id));
  }
}
