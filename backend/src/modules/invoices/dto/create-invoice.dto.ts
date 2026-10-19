import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
  subscription_id: string;

  @IsDateString()
  due_date: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  invoice_number?: string;
}
