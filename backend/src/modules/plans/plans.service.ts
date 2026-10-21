import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { CreatePlanDto } from './dto/create-plan.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import { serializeBigInt } from '../../common/utils/bigint.util.js';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.plans.findUnique({
      where: {
        code: dto.code,
      },
    });

    if (existing) {
      throw new BadRequestException(`Plan code '${dto.code}' already exists`);
    }

    return this.prisma.plans.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        billing_period: dto.billing_period,
        price: dto.price,
        trial_days: dto.trial_days ?? 14,
        active: dto.active ?? true,
      },
    });
  }

  async findAll() {
    const plans = await this.prisma.plans.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return serializeBigInt(plans);
  }

  async findOne(id: bigint) {
    const plan = await this.prisma.plans.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async update(id: bigint, dto: UpdatePlanDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.plans.findFirst({
        where: {
          code: dto.code,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(`Plan code '${dto.code}' already exists`);
      }
    }

    return this.prisma.plans.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: bigint) {
    await this.findOne(id);

    const subscriptions = await this.prisma.subscriptions.count({
      where: {
        plan_id: id,
      },
    });

    if (subscriptions > 0) {
      throw new BadRequestException('Plan has active subscriptions');
    }

    await this.prisma.plans.delete({
      where: { id },
    });

    return {
      success: true,
    };
  }
}
