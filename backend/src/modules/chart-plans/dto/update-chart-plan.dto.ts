import { PartialType } from '@nestjs/mapped-types';
import { CreateChartPlanDto } from './create-chart-plan.dto.js';

export class UpdateChartPlanDto extends PartialType(
  CreateChartPlanDto,
) {}