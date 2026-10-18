import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsDateString()
  entry_date?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
