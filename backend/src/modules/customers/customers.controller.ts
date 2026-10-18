import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';

import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import type { AuthRequest } from '../../common/interfaces/auth-request.interface.js';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body() dto: CreateCustomerDto,
    @Request() req: AuthRequest,
  ) {
    return this.customersService.create(dto, BigInt(req.user.companyId));
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.customersService.findAll(BigInt(req.user.companyId));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.customersService.findOne(
      BigInt(id),
      BigInt(req.user.companyId),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Request() req: AuthRequest,
  ) {
    return this.customersService.update(
      BigInt(id),
      BigInt(req.user.companyId),
      dto
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.customersService.remove(BigInt(id), BigInt(req.user.companyId));
  }
}
