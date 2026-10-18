import { PartialType } from '@nestjs/mapped-types';
import { CreateReceivableDto } from './create-receivable.dto.js';

export class UpdateReceivableDto extends PartialType(CreateReceivableDto) {}
