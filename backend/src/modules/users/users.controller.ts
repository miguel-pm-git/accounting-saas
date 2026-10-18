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

import { Role } from '../../common/enums/role.enum.js';

import { UsersService } from './users.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

type AuthenticatedRequest = {
  user: {
    companyId: string | number | bigint;
  };
};

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  create(@Body() dto: CreateUserDto, @Request() req: AuthenticatedRequest) {
    return this.usersService.create(dto, BigInt(req.user.companyId));
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.MANAGER)
  findAll(@Request() req: AuthenticatedRequest) {
    return this.usersService.findAll(BigInt(req.user.companyId));
  }

  @Get('me')
  getMe(@Request() req: { user: any }) {
    return this.usersService.findOne(
      BigInt(req.user.sub),
      BigInt(req.user.companyId),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(BigInt(id), BigInt(req.user.companyId));
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.update(
      BigInt(id),
      BigInt(req.user.companyId),
      dto,
    );
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.usersService.remove(BigInt(id), BigInt(req.user.companyId));
  }
}
