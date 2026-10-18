import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ChartAccountTemplatesService } from './chart-account-templates.service.js';
import { CreateChartAccountTemplateDto } from './dto/create-chart-account-template.dto.js';
import { UpdateChartAccountTemplateDto } from './dto/update-chart-account-template.dto.js';

@Controller('chart-account-templates')
export class ChartAccountTemplatesController {
  constructor(
    private readonly chartAccountTemplatesService:
      ChartAccountTemplatesService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateChartAccountTemplateDto,
  ) {
    return this.chartAccountTemplatesService.create(dto);
  }

  @Get()
  findAll() {
    return this.chartAccountTemplatesService.findAll();
  }

  @Get('plan/:chartPlanId')
  findByPlan(
    @Param('chartPlanId', ParseIntPipe)
    chartPlanId: number,
  ) {
    return this.chartAccountTemplatesService.findByPlan(
      BigInt(chartPlanId),
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.chartAccountTemplatesService.findOne(
      BigInt(id),
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateChartAccountTemplateDto,
  ) {
    return this.chartAccountTemplatesService.update(
      BigInt(id),
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.chartAccountTemplatesService.remove(
      BigInt(id),
    );
  }
}