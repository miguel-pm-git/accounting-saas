import {
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @MaxLength(10)
  @Matches(/^\d+$/, {
    message: 'Código do banco deve conter apenas números',
  })
  bankCode: string;

  @IsString()
  @MaxLength(100)
  bankName: string;

  @IsString()
  @MaxLength(20)
  agency: string;

  @IsString()
  @MaxLength(30)
  accountNumber: string;
}