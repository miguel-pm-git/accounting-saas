import { Injectable, ConflictException } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../prisma/prisma.service.js';

import { CreateCompanyDto } from './dto/create-company.dto.js';

import { serializeBigInt } from '../../common/utils/bigint.util.js';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const companyExists = await this.prisma.companies.findUnique({
      where: {
        tax_id: createCompanyDto.tax_id,
      },
    });

    if (companyExists) {
      throw new ConflictException('Empresa já cadastrada');
    }

    //return this.prisma.companies.create({
    const company = await this.prisma.companies.create({
      data: {
        uuid: uuidv4(),
        legal_name: createCompanyDto.legal_name,
        trade_name: createCompanyDto.trade_name,
        tax_id: createCompanyDto.tax_id,
        email: createCompanyDto.email,
        phone: createCompanyDto.phone,
      },
    });

    return serializeBigInt(company);
  }

  async findAll() {
    const companies = await this.prisma.companies.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return serializeBigInt(companies);
  }

  async findOne(id: bigint) {
    const company = await this.prisma.companies.findUnique({
      where: {
        id,
      },
    });

    return serializeBigInt(company);
  }
}
