import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  cancellation_reason,
  subscription_status,
} from '../../generated/prisma/client.js';

import { PrismaService } from '../../prisma/prisma.service.js';

import { ChangePlanDto } from './dto/change-plan.dto.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto.js';
import { InvoicesService } from '../invoices/invoices.service.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const plan = await this.prisma.plans.findUnique({
      where: {
        id: BigInt(dto.plan_id),
      },
    });

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    const existing = await this.prisma.subscriptions.findFirst({
      where: {
        company_id: BigInt(dto.company_id),
        status: {
          in: [
            subscription_status.TRIALING,
            subscription_status.ACTIVE,
            subscription_status.PAST_DUE,
          ],
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Empresa Já possui uma assinatura ativa');
    }

    const today = new Date();

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + plan.trial_days);

    const subscription = await this.prisma.subscriptions.create({
      data: {
        company_id: BigInt(dto.company_id),
        plan_id: BigInt(dto.plan_id),

        status: subscription_status.TRIALING,

        started_at: today,
        trial_ends_at: trialEndsAt,

        current_period_start: today,
        current_period_end: trialEndsAt,
      },
      include: {
        plans: true,
      },
    });

    if (plan.trial_days === 0) {
      await this.invoicesService.generateInvoice(subscription.id);
    }

    return subscription;
  }

  async findAll() {
    return this.prisma.subscriptions.findMany({
      include: {
        plans: true,
        companies: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: bigint) {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { id },
      include: {
        plans: true,
        companies: true,
        subscription_history: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    await this.prisma.subscription_history.create({
      data: {
        subscription_id: subscription.id,
        new_plan_id: subscription.plan_id,
        notes: 'Assinatura criada',
      },
    });

    return subscription;
  }

  async getActiveByCompany(companyId: bigint) {
    return this.prisma.subscriptions.findFirst({
      where: {
        company_id: companyId,
        status: {
          in: [
            subscription_status.TRIALING,
            subscription_status.ACTIVE,
            subscription_status.PAST_DUE,
          ],
        },
      },
      include: {
        plans: true,
      },
    });
  }

  async changePlan(subscriptionId: bigint, dto: ChangePlanDto) {
    const subscription = await this.findOne(subscriptionId);

    const newPlan = await this.prisma.plans.findUnique({
      where: {
        id: BigInt(dto.new_plan_id),
      },
    });

    if (!newPlan) {
      throw new BadRequestException('Plan not found');
    }

    const updated = await this.prisma.subscriptions.update({
      where: { id: subscriptionId },
      data: {
        plan_id: BigInt(dto.new_plan_id),
      },
    });

    await this.prisma.subscription_history.create({
      data: {
        subscription_id: subscriptionId,
        old_plan_id: subscription.plan_id,
        new_plan_id: BigInt(dto.new_plan_id),
        notes: dto.notes,
      },
    });

    return updated;
  }

  async cancel(subscriptionId: bigint, dto: CancelSubscriptionDto) {
    const subscription = await this.findOne(subscriptionId);

    await this.prisma.subscription_cancellations.create({
      data: {
        subscription_id: subscriptionId,
        reason: dto.reason ?? cancellation_reason.OTHER,
        notes: dto.notes,
      },
    });

    await this.prisma.subscription_history.create({
      data: {
        subscription_id: subscriptionId,
        notes: `Cancelada: ${dto.reason ?? cancellation_reason.OTHER}`,
      },
    });

    return this.prisma.subscriptions.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: subscription_status.CANCELED,
        cancelled_at: new Date(),
      },
    });
  }

  async renew(subscriptionId: bigint) {
    const subscription = await this.findOne(subscriptionId);

    if (!subscription.current_period_end) {
      throw new BadRequestException(
        'Assinatura sem período atual definido',
      );
    }

    const nextPeriodStart = subscription.current_period_end;

    const nextPeriodEnd = new Date(nextPeriodStart);

    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    const updated = await this.prisma.subscriptions.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: subscription_status.ACTIVE,
        current_period_start: nextPeriodStart,
        current_period_end: nextPeriodEnd,
      },
    });

    await this.invoicesService.generateInvoice(subscriptionId);

    await this.prisma.subscription_history.create({
      data: {
        subscription_id: subscriptionId,
        old_plan_id: subscription.plan_id,
        new_plan_id: subscription.plan_id,
        notes: 'Assinatura renovada',
      },
    });

    return updated;
  }

  async processTrialExpiration(subscriptionId: bigint) {
    const subscription = await this.findOne(subscriptionId);

    await this.prisma.subscriptions.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: subscription_status.PAST_DUE,
      },
    });

    await this.invoicesService.generateInvoice(subscriptionId);
  }

  async getHistory(subscriptionId: bigint) {
    return this.prisma.subscription_history.findMany({
      where: {
        subscription_id: subscriptionId,
      },
      include: {
        old_plan: true,
        new_plan: true,
      },
      orderBy: {
        changed_at: 'desc',
      },
    });
  }
}
