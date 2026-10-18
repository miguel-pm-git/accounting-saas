import { PartialType } from '@nestjs/mapped-types';
import { CreateChartAccountTemplateDto } from './create-chart-account-template.dto.js';

export class UpdateChartAccountTemplateDto extends PartialType(
  CreateChartAccountTemplateDto,
) {}
