import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';

import { serializeBigInt } from '../../common/utils/bigint.util.js';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: bigint, dto: CreateSupplierDto) {
    if (dto.document_number) {
      const exists = await this.prisma.suppliers.findFirst({
        where: {
          company_id: companyId,
          document_number: dto.document_number,
        },
      });

      if (exists) {
        throw new BadRequestException(
          'Documento já cadastrado para esta empresa.',
        );
      }
    }

    const supplier = await this.prisma.suppliers.create({
      data: {
        company_id: companyId,
        name: dto.name,
        document_number: dto.document_number,
        email: dto.email,
        phone: dto.phone,
      },
    });

    return serializeBigInt(supplier);
  }

  async findAll(companyId: bigint) {
    const suppliers = await this.prisma.suppliers.findMany({
      where: {
        company_id: companyId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return serializeBigInt(suppliers);
  }

  async findOne(id: bigint, companyId: bigint) {
    const supplier = await this.prisma.suppliers.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return serializeBigInt(supplier);
  }

  async update(id: bigint, companyId: bigint, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.suppliers.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    if (dto.document_number) {
      const duplicate = await this.prisma.suppliers.findFirst({
        where: {
          company_id: companyId,
          document_number: dto.document_number,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Documento já cadastrado para esta empresa.',
        );
      }
    }

    const updated = await this.prisma.suppliers.update({
      where: { id },
      data: dto,
    });

    return serializeBigInt(updated);
  }

  async remove(id: bigint, companyId: bigint) {
    const supplier = await this.prisma.suppliers.findFirst({
      where: {
        id,
        company_id: companyId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    await this.prisma.suppliers.delete({
      where: { id },
    });

    return {
      message: 'Fornecedor removido com sucesso',
    };
  }
}
