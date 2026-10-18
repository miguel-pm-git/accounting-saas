import { Injectable } from '@nestjs/common';
import { CreatePayableDto } from './dto/create-payable.dto.js';
import { UpdatePayableDto } from './dto/update-payable.dto.js';

@Injectable()
export class PayablesService {
  create(createPayableDto: CreatePayableDto) {
    return 'This action adds a new payable';
  }

  findAll() {
    return `This action returns all payables`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payable`;
  }

  update(id: number, updatePayableDto: UpdatePayableDto) {
    return `This action updates a #${id} payable`;
  }

  remove(id: number) {
    return `This action removes a #${id} payable`;
  }
}
