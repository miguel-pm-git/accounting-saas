import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateBankAccountDto } from './create-bank-account.dto.js';

export class UpdateBankAccountDto extends PartialType(
  CreateBankAccountDto,
) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}