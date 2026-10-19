import { IsInt, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsInt()
  @Min(1)
  company_id!: number;

  @IsInt()
  @Min(1)
  plan_id!: number;
}
