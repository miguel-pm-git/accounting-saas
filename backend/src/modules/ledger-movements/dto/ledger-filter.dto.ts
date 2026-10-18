import {
  IsDateString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class LedgerFilterDto {
  @IsOptional()
  @IsNumber()
  account_id?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}