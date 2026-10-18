import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { CreateChartPlanDto } from './dto/create-chart-plan.dto.js';
import { UpdateChartPlanDto } from './dto/update-chart-plan.dto.js';

import { serializeBigInt } from '../../common/utils/bigint.util.js';

@Injectable()
export class ChartPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChartPlanDto) {
    const exists = await this.prisma.chart_plans.findUnique({
      where: {
        code: dto.code,
      },
    });

    if (exists) {
      throw new BadRequestException('Código já cadastrado.');
    }

    const plan = await this.prisma.chart_plans.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        active: dto.active ?? true,
      },
    });
    return serializeBigInt(plan);
  }

  findAll() {
    const plans = this.prisma.chart_plans.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return serializeBigInt(plans);
  }

  async findOne(id: bigint) {
    const plan = await this.prisma.chart_plans.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    return serializeBigInt(plan);
  }

  async update(id: bigint, dto: UpdateChartPlanDto) {
    const plan = await this.prisma.chart_plans.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (dto.code && dto.code !== plan.code) {
      const duplicate = await this.prisma.chart_plans.findUnique({
        where: {
          code: dto.code,
        },
      });

      if (duplicate) {
        throw new BadRequestException('Código já cadastrado.');
      }
    }

    const updatedPlan = await this.prisma.chart_plans.update({
      where: { id },
      data: dto,
    });
    return serializeBigInt(updatedPlan);
  }

  async remove(id: bigint) {
    const plan = await this.prisma.chart_plans.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const templates = await this.prisma.chart_account_templates.count({
      where: {
        chart_plan_id: id,
      },
    });

    if (templates > 0) {
      throw new BadRequestException(
        'Existem templates associados a este plano.',
      );
    }

    if (plan.code === 'STANDARD') {
      throw new BadRequestException('O plano padrão não pode ser removido.');
    }

    const companies = await this.prisma.companies.count({
      where: {
        chart_plan_id: id,
      },
    });

    if (companies > 0) {
      throw new BadRequestException('Existem empresas utilizando este plano.');
    }

    await this.prisma.chart_plans.delete({
      where: { id },
    });

    return {
      message: 'Plano removido com sucesso',
    };
  }

  async initializeCompanyAccounts(chartPlanId: bigint, companyId: bigint) {
    const company = await this.prisma.companies.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const templates = await this.prisma.chart_account_templates.findMany({
      where: {
        chart_plan_id: chartPlanId,
        active: true,
      },
      orderBy: {
        code: 'asc',
      },
    });

    if (!templates.length) {
      throw new BadRequestException('O plano não possui contas modelo.');
    }

    const existingAccounts = await this.prisma.chart_accounts.count({
      where: {
        company_id: companyId,
      },
    });

    if (existingAccounts > 0) {
      throw new BadRequestException(
        'A empresa já possui contas contábeis cadastradas.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const templateMap = new Map<bigint, bigint>();

      //
      // Primeira passagem:
      // cria as contas sem parent_id
      //
      for (const template of templates) {
        const account = await tx.chart_accounts.create({
          data: {
            company_id: companyId,
            template_id: template.id,
            code: template.code,
            name: template.name,
            category: template.category,
            analytical: template.analytical,
            active: template.active,
          },
        });

        templateMap.set(template.id, account.id);
      }

      //
      // Segunda passagem:
      // reconstrói parent_id
      //
      for (const template of templates) {
        if (!template.parent_id) {
          continue;
        }

        const accountId = templateMap.get(template.id);

        const parentAccountId = templateMap.get(template.parent_id);

        if (accountId && parentAccountId) {
          await tx.chart_accounts.update({
            where: {
              id: accountId,
            },
            data: {
              parent_id: parentAccountId,
            },
          });
        }
      }

      return {
        success: true,
        companyId,
        chartPlanId,
        accountsCreated: templates.length,
      };
    });
  }
}
