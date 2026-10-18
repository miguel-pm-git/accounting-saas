import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CashMovementsService } from './cash-movements.service.js';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto.js';
import { UpdateCashMovementDto } from './dto/update-cash-movement.dto.js';

@Controller('cash-movements')
export class CashMovementsController {
  constructor(private readonly cashMovementsService: CashMovementsService) {}

  @Post()
  create(@Body() createCashMovementDto: CreateCashMovementDto) {
    return this.cashMovementsService.create(createCashMovementDto);
  }

  @Get()
  findAll() {
    return this.cashMovementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashMovementsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCashMovementDto: UpdateCashMovementDto) {
    return this.cashMovementsService.update(+id, updateCashMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashMovementsService.remove(+id);
  }
}
