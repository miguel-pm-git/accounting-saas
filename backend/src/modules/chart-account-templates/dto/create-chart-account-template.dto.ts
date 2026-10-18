import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { chart_accounts_category } from '../../../generated/prisma/client.js';

export class CreateChartAccountTemplateDto {
  @IsNumber()
  chart_plan_id: number;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(chart_accounts_category)
  category: chart_accounts_category;

  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @IsOptional()
  @IsBoolean()
  analytical?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
