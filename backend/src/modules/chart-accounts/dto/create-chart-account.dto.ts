import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { chart_accounts_category } from '../../../generated/prisma/client.js';

export class CreateChartAccountDto {
  @IsOptional()
  template_id?: string;

  @IsString()
  @MaxLength(30)
  code: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsEnum(chart_accounts_category)
  category: chart_accounts_category;

  @IsOptional()
  parent_id?: string;

  @IsOptional()
  @IsBoolean()
  analytical?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
