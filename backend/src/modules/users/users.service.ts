import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

//import { Role } from '../../common/enums/role.enum.js';
//import { Status } from '../../common/enums/status.enum.js';
//import { UserStatus } from '@prisma/client';
import { UserRole, UserStatus } from '../../generated/prisma/client.js';


import { PrismaService } from '../../prisma/prisma.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

import { serializeBigInt } from '../../common/utils/bigint.util.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto, companyId: bigint) {
    const exists = await this.prisma.users.findFirst({
      where: {
        company_id: companyId,
        email: dto.email,
      },
    });

    if (exists) {
      throw new ConflictException('Usuário já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        company_id: companyId,
        name: dto.name,
        email: dto.email,
        password_hash: passwordHash,
        active: dto.active ?? true,
        role: dto.role ?? UserRole.EMPLOYEE,
        status: (dto.status as UserStatus | undefined) ?? UserStatus.ACTIVE,
      },
    });

    const { password_hash, ...result } = user;

    return serializeBigInt(result);
  }

  async findAll(companyId: bigint) {
    const users = await this.prisma.users.findMany({
      where: {
        company_id: companyId,
      },
      select: {
        id: true,
        company_id: true,
        name: true,
        email: true,
        active: true,
        role: true,
        status: true,
        created_at: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return serializeBigInt(users);
  }

  async findOne(id: bigint, companyId: bigint) {
    const user = await this.prisma.users.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { password_hash, ...result } = user;

    return serializeBigInt(result);
  }

  async update(id: bigint, companyId: bigint, dto: UpdateUserDto) {
    await this.findOne(id, companyId);

    const data: any = {
      ...dto,
    };

    if (dto.password) {
      data.password_hash = await bcrypt.hash(dto.password, 10);

      delete data.password;
    }

    const user = await this.prisma.users.update({
      where: {
        id,
      },
      data,
    });

    const { password_hash, ...result } = user;

    return serializeBigInt(result);
  }

  async remove(id: bigint, companyId: bigint) {
    await this.findOne(id, companyId);

    const user = await this.prisma.users.update({
      where: {
        id,
      },
      data: {
        active: false,
        status: UserStatus.INACTIVE,
      },
    });

    const { password_hash, ...result } = user;

    return serializeBigInt(result);
  }
}
