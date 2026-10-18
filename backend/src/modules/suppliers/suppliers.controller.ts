import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { SuppliersService } from './suppliers.service.js';

import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';

interface AuthRequest {
  user: {
    sub: string;
    companyId: string;
  };
}

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@Body() dto: CreateSupplierDto, @Request() req: AuthRequest) {
    return this.suppliersService.create(BigInt(req.user.companyId), dto);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.suppliersService.findAll(BigInt(req.user.companyId));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.suppliersService.findOne(
      BigInt(id),
      BigInt(req.user.companyId),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @Request() req: AuthRequest,
  ) {
    return this.suppliersService.update(
      BigInt(id),
      BigInt(req.user.companyId),
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.suppliersService.remove(BigInt(id), BigInt(req.user.companyId));
  }
}
