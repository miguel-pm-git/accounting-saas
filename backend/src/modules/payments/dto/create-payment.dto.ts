import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';

import { payment_gateway } from '../../../generated/prisma/client.js';

export class CreatePaymentDto {
  @IsString()
  invoice_id: string;

  @IsEnum(payment_gateway)
  gateway: payment_gateway;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  transaction_id?: string;
}
