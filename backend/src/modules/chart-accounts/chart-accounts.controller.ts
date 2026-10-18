import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChartAccountsService } from './chart-accounts.service.js';
import { CreateChartAccountDto } from './dto/create-chart-account.dto.js';
import { UpdateChartAccountDto } from './dto/update-chart-account.dto.js';

@Controller('chart-accounts')
export class ChartAccountsController {
  constructor(private readonly chartAccountsService: ChartAccountsService) {}

  @Post()
  create(@Body() createChartAccountDto: CreateChartAccountDto) {
    return this.chartAccountsService.create(createChartAccountDto);
  }

  @Get()
  findAll() {
    return this.chartAccountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chartAccountsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChartAccountDto: UpdateChartAccountDto) {
    return this.chartAccountsService.update(+id, updateChartAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chartAccountsService.remove(+id);
  }
}
