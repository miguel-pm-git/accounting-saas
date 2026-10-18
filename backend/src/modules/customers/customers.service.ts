import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { serializeBigInt } from '../../common/utils/bigint.util.js';

import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto, companyId: bigint) {
    if (dto.document_number) {
      const exists = await this.prisma.customers.findFirst({
        where: {
          company_id: companyId,
          document_number: dto.document_number,
        },
      });

      if (exists) {
        throw new ConflictException('Cliente já cadastrado para esta empresa');
      }
    }

    try {
      const customer = await this.prisma.customers.create({
        data: {
          company_id: companyId,
          name: dto.name,
          document_number: dto.document_number,
          email: dto.email,
          phone: dto.phone,
        },
      });

      return serializeBigInt(customer);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Cliente já cadastrado para esta empresa');
      }

      throw error;
    }
  }

  async findAll(companyId: bigint) {
    const customers = await this.prisma.customers.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return serializeBigInt(customers);
  }

  async findOne(id: bigint, companyId: bigint) {
    const customer = await this.prisma.customers.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return serializeBigInt(customer);
  }

  async update(id: bigint, companyId: bigint, dto: UpdateCustomerDto) {
    await this.findOne(id, companyId);

    if (dto.document_number) {
      const exists = await this.prisma.customers.findFirst({
        where: {
          company_id: companyId,
          document_number: dto.document_number,
          NOT: {
            id,
          },
        },
      });

      if (exists) {
        throw new ConflictException('Já existe um cliente com este documento');
      }
    }

    try {
      const customer = await this.prisma.customers.update({
        where: {
          id,
        },
        data: dto,
      });

      return serializeBigInt(customer);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Já existe um cliente com este documento');
      }

      throw error;
    }
  }

  async remove(id: bigint, companyId: bigint) {
    await this.findOne(id, companyId);

    await this.prisma.customers.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Cliente removido com sucesso',
    };
  }
}
