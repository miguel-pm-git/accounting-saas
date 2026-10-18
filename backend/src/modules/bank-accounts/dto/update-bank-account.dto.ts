import { PartialType } from '@nestjs/mapped-types';
import { CreateBankAccountDto } from './create-bank-account.dto.js';

export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {}
