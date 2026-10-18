import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReversalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}