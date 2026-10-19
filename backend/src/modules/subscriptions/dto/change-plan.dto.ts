import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class ChangePlanDto {
  @IsInt()
  @Min(1)
  new_plan_id!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
