import { Injectable } from '@nestjs/common';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto.js';
import { UpdateCashMovementDto } from './dto/update-cash-movement.dto.js';

@Injectable()
export class CashMovementsService {
  create(createCashMovementDto: CreateCashMovementDto) {
    return 'This action adds a new cashMovement';
  }

  findAll() {
    return `This action returns all cashMovements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cashMovement`;
  }

  update(id: number, updateCashMovementDto: UpdateCashMovementDto) {
    return `This action updates a #${id} cashMovement`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashMovement`;
  }
}
