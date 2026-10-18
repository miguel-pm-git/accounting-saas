import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Length(3, 255)
  legal_name: string;

  @IsOptional()
  @IsString()
  trade_name?: string;

  @IsString()
  @Length(11, 20)
  tax_id: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
