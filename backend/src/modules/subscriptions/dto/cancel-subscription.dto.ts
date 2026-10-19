import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { cancellation_reason } from '../../../generated/prisma/client.js';

export class CancelSubscriptionDto {
  @IsEnum(cancellation_reason)
  reason!: cancellation_reason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
