import { IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsOptional()
  @IsString()
  transaction_id?: string;
}
