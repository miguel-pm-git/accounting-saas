import { PartialType } from '@nestjs/mapped-types';
import { CreateChartAccountDto } from './create-chart-account.dto.js';

export class UpdateChartAccountDto extends PartialType(CreateChartAccountDto) {}
