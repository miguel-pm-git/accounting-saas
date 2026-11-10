# CLAUDE.md

SaaS de contabilidade, cadastros e controles financeiros para **MEI** (Microempreendedor Individual).
Visão de produto, funcionalidades e regras de negócio: **[docs/visao-produto.md](docs/visao-produto.md)** — consulte antes de propor novas funcionalidades ou mudanças de modelagem.

Idioma: documentação, mensagens de erro e commits em **português (pt-BR)**; identificadores de código em inglês (nomes de tabelas/colunas em snake_case).

## Ferramentas (Stack)

Base: **NestJS + Prisma + MySQL**

- **NestJS 12** (TypeScript 6, ESM — `"type": "module"`)
- **Prisma ORM 7** com driver adapter `@prisma/adapter-mariadb`
- **MySQL** (compatível com MariaDB)
- Autenticação: `@nestjs/jwt` + Passport (`passport-jwt`), senhas com `bcrypt`
- Validação de DTOs: `class-validator` / `class-transformer`
- Jobs agendados: `@nestjs/schedule`
- Logs: `winston` (`nest-winston`)
- Gateway de pagamento (billing do SaaS): Asaas, via `@nestjs/axios`
- Testes: **Vitest** (+ `supertest` para e2e); lint: **oxlint**; formatação: Prettier

## Estrutura

```
backend/
├── prisma/
│   ├── schema.prisma          # schema do banco (fonte da verdade)
│   ├── migrations/            # migrations SQL (000_initial_baseline)
│   └── seed.ts                # seed (planos de contas, planos do SaaS, etc.)
├── prisma7.config.ts          # config do Prisma CLI (schema, migrations, seed, DATABASE_URL)
├── src/
│   ├── main.ts / app.module.ts
│   ├── prisma/                # PrismaService (global) — usa PrismaMariaDb
│   ├── generated/prisma/      # Prisma Client gerado — NÃO editar manualmente
│   ├── config/                # configs (jwt.config.ts)
│   ├── common/                # tenant/, base/, interceptors/, enums/, constants/, utils/
│   └── modules/<entidade>/    # um módulo Nest por entidade
│       ├── <entidade>.controller.ts / .service.ts / .module.ts
│       ├── *.spec.ts          # testes unitários ao lado do código
│       └── dto/  entities/
└── test/                      # testes e2e (*.e2e-spec.ts)
```

Domínios dos módulos:
- **Tenant/Acesso:** `auth`, `users`, `companies`, `audit-logs`
- **Contabilidade:** `chart-plans` → `chart-account-templates` → `chart-accounts`, `company-accounts`, `journal-entries`, `journal-reversals`, `ledger-movements`
- **Financeiro:** `bank-accounts`, `cash-movements`, `customers`, `receivables`, `suppliers`, `payables`
- **Billing do SaaS:** `plans`, `subscriptions`, `invoices`, `payments`, `billing`

## Comandos

Todos executados dentro de `backend/`:

```bash
npm run start:dev          # servidor em modo watch (porta PORT, padrão 3000)
npm run build              # build (nest build)
npm run lint               # oxlint src/ test/
npm run format             # prettier
npm test                   # testes unitários (vitest run)
npm run test:e2e           # testes e2e
npm run test:cov           # cobertura

npx prisma validate        # valida o schema
npx prisma generate        # regenera o client em src/generated/prisma
npx prisma migrate dev --name <nome>   # cria/aplica migration em dev
npx prisma db seed         # executa prisma/seed.ts
```

Variáveis de ambiente (`backend/.env`): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`, `ASAAS_API_URL`, `ASAAS_API_KEY`, `PAYMENT_GATEWAY`.

## Convenções

- **Imports ESM com extensão `.js`** em caminhos relativos (ex.: `import { X } from './x.service.js'`).
- **Multi-tenant:** toda tabela de negócio tem `company_id`; toda consulta deve filtrar pela empresa do usuário autenticado (`request.user.companyId`, vindo do JWT).
  - `TenantContext` (`src/common/tenant/`) é request-scoped e expõe `getCompanyId()`.
  - `TenantBaseService` (`src/common/base/`) oferece `getCompanyId()` e `tenantWhere()`.
  - Hoje coexistem dois padrões: services que estendem `TenantBaseService` (users, journal-entries, journal-reversals, ledger-movements) e services que recebem `companyId: bigint` como parâmetro do controller (customers, suppliers, bank-accounts, ...). Mantenha o padrão já usado no módulo que estiver alterando.
  - Ao relacionar registros (ex.: recebível → cliente, recebimento → conta bancária), validar que ambos pertencem à mesma empresa — o banco não garante isso.
- **IDs são `BigInt`** (`UnsignedBigInt`): converter na entrada (`BigInt(id)`) e serializar na saída com `serializeBigInt` (`src/common/utils/bigint.util.ts`).
- **Valores monetários** são `Decimal(18,2)` — nunca usar `number`/float para cálculos financeiros.
- **Contabilidade por partidas dobradas:** todo lançamento (`journal_entries`) deve ter `total_debit === total_credit`. Lançamentos `POSTED` não são editados nem apagados — correções são feitas por estorno (`journal-reversals`).
- Operações que alteram mais de uma tabela (baixa de título + lançamento contábil + movimento de caixa) devem usar `prisma.$transaction`.
- Após alterar `schema.prisma`: criar migration (`migrate dev`) e rodar `prisma generate`. Nunca editar migrations já aplicadas.
- Exceções HTTP do Nest (`BadRequestException`, `NotFoundException`, ...) com mensagens em português.

## Pontos de atenção conhecidos

- `TenantInterceptor` está registrado, mas não faz nada (apenas `next.handle()`).
- `TenantContext.getCompanyId()` contém `console.log` de debug do request — remover.
- Não há `ValidationPipe` global em `main.ts`: os decorators de `class-validator` dos DTOs não estão sendo aplicados.
- Falta `prisma/migrations/migration_lock.toml`.
- Os comentários `/// check constraints` no schema indicam CHECKs que não estão na migration baseline.
