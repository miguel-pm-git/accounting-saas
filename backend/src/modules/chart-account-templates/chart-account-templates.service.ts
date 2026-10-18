import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateChartAccountTemplateDto } from './dto/create-chart-account-template.dto.js';
import { UpdateChartAccountTemplateDto } from './dto/update-chart-account-template.dto.js';

@Injectable()
export class ChartAccountTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChartAccountTemplateDto) {
    const exists = await this.prisma.chart_account_templates.findFirst({
      where: {
        chart_plan_id: BigInt(dto.chart_plan_id),
        code: dto.code,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Já existe uma conta com este código neste plano.',
      );
    }

    if (dto.parent_id) {
      const parent = await this.prisma.chart_account_templates.findUnique({
        where: {
          id: BigInt(dto.parent_id),
        },
      });

      if (!parent) {
        throw new NotFoundException('Conta pai não encontrada.');
      }
    }

    return this.prisma.chart_account_templates.create({
      data: {
        chart_plan_id: BigInt(dto.chart_plan_id),
        code: dto.code,
        name: dto.name,
        category: dto.category,
        parent_id: dto.parent_id ? BigInt(dto.parent_id) : null,
        analytical: dto.analytical ?? true,
        active: dto.active ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.chart_account_templates.findMany({
      include: {
        parent: true,
        children: true,
        chart_plans: true,
      },
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findByPlan(chartPlanId: bigint) {
    return this.prisma.chart_account_templates.findMany({
      where: {
        chart_plan_id: chartPlanId,
      },
      include: {
        parent: true,
        children: true,
      },
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findOne(id: bigint) {
    const template = await this.prisma.chart_account_templates.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        chart_accounts: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Conta modelo não encontrada.');
    }

    return template;
  }

  async update(id: bigint, dto: UpdateChartAccountTemplateDto) {
    await this.findOne(id);

    if (dto.code) {
      const current = await this.prisma.chart_account_templates.findUnique({
        where: { id },
      });

      const duplicated = await this.prisma.chart_account_templates.findFirst({
        where: {
          chart_plan_id: current!.chart_plan_id,
          code: dto.code,
          NOT: {
            id,
          },
        },
      });

      if (duplicated) {
        throw new BadRequestException(
          'Já existe uma conta com este código neste plano.',
        );
      }
    }

    return this.prisma.chart_account_templates.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        category: dto.category,
        parent_id:
          dto.parent_id !== undefined
            ? dto.parent_id
              ? BigInt(dto.parent_id)
              : null
            : undefined,
        analytical: dto.analytical,
        active: dto.active,
      },
    });
  }

  async remove(id: bigint) {
    await this.findOne(id);

    const children = await this.prisma.chart_account_templates.count({
      where: {
        parent_id: id,
      },
    });

    if (children > 0) {
      throw new BadRequestException('Existem contas filhas vinculadas.');
    }

    return this.prisma.chart_account_templates.delete({
      where: { id },
    });
  }
}
