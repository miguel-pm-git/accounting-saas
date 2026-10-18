import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { journal_entry_items_type } from '../../../generated/prisma/client.js';

export class CreateJournalEntryItemDto {
  @IsNumber()
  account_id: number;

  @IsEnum(journal_entry_items_type)
  type: journal_entry_items_type;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}