import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import {
  PrismaClient,
  billing_period,
} from '../src/generated/prisma/client.js';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Seeding plans...');

  const starter = await prisma.plans.upsert({
    where: { code: 'STARTER' },
    update: {},
    create: {
      code: 'STARTER',
      name: 'Starter',
      description: 'Plano inicial',
      billing_period: billing_period.MONTHLY,
      price: 49.9,
      trial_days: 14,
      active: true,
    },
  });

  const professional = await prisma.plans.upsert({
    where: { code: 'PROFESSIONAL' },
    update: {},
    create: {
      code: 'PROFESSIONAL',
      name: 'Professional',
      description: 'Plano profissional',
      billing_period: billing_period.MONTHLY,
      price: 99.9,
      trial_days: 14,
      active: true,
    },
  });

  const business = await prisma.plans.upsert({
    where: { code: 'BUSINESS' },
    update: {},
    create: {
      code: 'BUSINESS',
      name: 'Business',
      description: 'Plano empresarial',
      billing_period: billing_period.MONTHLY,
      price: 199.9,
      trial_days: 14,
      active: true,
    },
  });

  const enterprise = await prisma.plans.upsert({
    where: { code: 'ENTERPRISE' },
    update: {},
    create: {
      code: 'ENTERPRISE',
      name: 'Enterprise',
      description: 'Plano corporativo',
      billing_period: billing_period.YEARLY,
      price: 2999.9,
      trial_days: 30,
      active: true,
    },
  });

  console.log('Seeding features...');

  const features = {
    MULTI_COMPANY: await prisma.features.upsert({
      where: { code: 'MULTI_COMPANY' },
      update: {},
      create: {
        code: 'MULTI_COMPANY',
        name: 'Multi Empresa',
        description: 'Permite múltiplas empresas',
      },
    }),

    API_ACCESS: await prisma.features.upsert({
      where: { code: 'API_ACCESS' },
      update: {},
      create: {
        code: 'API_ACCESS',
        name: 'Acesso API',
        description: 'Acesso à API REST',
      },
    }),

    COST_CENTERS: await prisma.features.upsert({
      where: { code: 'COST_CENTERS' },
      update: {},
      create: {
        code: 'COST_CENTERS',
        name: 'Centros de Custo',
        description: 'Controle por centro de custo',
      },
    }),

    BUDGETS: await prisma.features.upsert({
      where: { code: 'BUDGETS' },
      update: {},
      create: {
        code: 'BUDGETS',
        name: 'Orçamentos',
        description: 'Planejamento orçamentário',
      },
    }),

    BANK_RECONCILIATION: await prisma.features.upsert({
      where: { code: 'BANK_RECONCILIATION' },
      update: {},
      create: {
        code: 'BANK_RECONCILIATION',
        name: 'Conciliação Bancária',
        description: 'Conciliação automática',
      },
    }),

    FIXED_ASSETS: await prisma.features.upsert({
      where: { code: 'FIXED_ASSETS' },
      update: {},
      create: {
        code: 'FIXED_ASSETS',
        name: 'Ativo Imobilizado',
        description: 'Controle patrimonial',
      },
    }),

    UNLIMITED_USERS: await prisma.features.upsert({
      where: { code: 'UNLIMITED_USERS' },
      update: {},
      create: {
        code: 'UNLIMITED_USERS',
        name: 'Usuários Ilimitados',
        description: 'Sem limite de usuários',
      },
    }),

    UNLIMITED_JOURNAL_ENTRIES: await prisma.features.upsert({
      where: { code: 'UNLIMITED_JOURNAL_ENTRIES' },
      update: {},
      create: {
        code: 'UNLIMITED_JOURNAL_ENTRIES',
        name: 'Lançamentos Ilimitados',
        description: 'Sem limite de lançamentos',
      },
    }),
  };

  console.log('Seeding plan features...');

  async function attachFeature(planId: bigint, featureId: bigint) {
    await prisma.plan_features.upsert({
      where: {
        plan_id_feature_id: {
          plan_id: planId,
          feature_id: featureId,
        },
      },
      update: {},
      create: {
        plan_id: planId,
        feature_id: featureId,
      },
    });
  }

  // STARTER

  await attachFeature(starter.id, features.MULTI_COMPANY.id);

  // PROFESSIONAL

  await attachFeature(professional.id, features.MULTI_COMPANY.id);

  await attachFeature(professional.id, features.COST_CENTERS.id);

  await attachFeature(professional.id, features.BANK_RECONCILIATION.id);

  // BUSINESS

  await attachFeature(business.id, features.MULTI_COMPANY.id);

  await attachFeature(business.id, features.COST_CENTERS.id);

  await attachFeature(business.id, features.BANK_RECONCILIATION.id);

  await attachFeature(business.id, features.BUDGETS.id);

  await attachFeature(business.id, features.FIXED_ASSETS.id);

  await attachFeature(business.id, features.API_ACCESS.id);

  // ENTERPRISE

  for (const feature of Object.values(features)) {
    await attachFeature(enterprise.id, feature.id);
  }

  console.log('Seeding limits...');

  async function upsertLimit(
    planId: bigint,
    resourceCode: string,
    limitValue: number,
  ) {
    await prisma.plan_limits.upsert({
      where: {
        plan_id_resource_code: {
          plan_id: planId,
          resource_code: resourceCode,
        },
      },
      update: {
        limit_value: limitValue,
      },
      create: {
        plan_id: planId,
        resource_code: resourceCode,
        limit_value: limitValue,
      },
    });
  }

  // STARTER

  await upsertLimit(starter.id, 'USERS', 5);
  await upsertLimit(starter.id, 'COMPANIES', 1);
  await upsertLimit(starter.id, 'CHART_ACCOUNTS', 1000);
  await upsertLimit(starter.id, 'JOURNAL_ENTRIES', 10000);

  // PROFESSIONAL

  await upsertLimit(professional.id, 'USERS', 20);
  await upsertLimit(professional.id, 'COMPANIES', 3);
  await upsertLimit(professional.id, 'CHART_ACCOUNTS', 5000);
  await upsertLimit(professional.id, 'JOURNAL_ENTRIES', 50000);

  // BUSINESS

  await upsertLimit(business.id, 'USERS', 100);
  await upsertLimit(business.id, 'COMPANIES', 10);
  await upsertLimit(business.id, 'CHART_ACCOUNTS', 50000);
  await upsertLimit(business.id, 'JOURNAL_ENTRIES', 500000);

  // ENTERPRISE

  await upsertLimit(enterprise.id, 'USERS', 999999);
  await upsertLimit(enterprise.id, 'COMPANIES', 999999);
  await upsertLimit(enterprise.id, 'CHART_ACCOUNTS', 999999);
  await upsertLimit(enterprise.id, 'JOURNAL_ENTRIES', 999999);

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
