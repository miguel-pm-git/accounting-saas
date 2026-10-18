import { Injectable } from '@nestjs/common';
import { CreateChartAccountDto } from './dto/create-chart-account.dto.js';
import { UpdateChartAccountDto } from './dto/update-chart-account.dto.js';

@Injectable()
export class ChartAccountsService {
  create(createChartAccountDto: CreateChartAccountDto) {
    return 'This action adds a new chartAccount';
  }

  findAll() {
    return `This action returns all chartAccounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chartAccount`;
  }

  update(id: number, updateChartAccountDto: UpdateChartAccountDto) {
    return `This action updates a #${id} chartAccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} chartAccount`;
  }
}
