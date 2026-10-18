import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateJournalEntryItemDto } from './create-journal-entry-item.dto.js';

export class CreateJournalEntryDto {
  @IsDateString()
  entry_date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryItemDto)
  items: CreateJournalEntryItemDto[];
}
