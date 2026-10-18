import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CustomersService } from './customers.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

import { vi } from 'vitest';

describe('CustomersService', () => {
  let service: CustomersService;

  const prismaMock = {
    customers: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve impedir documento duplicado na mesma empresa', async () => {
    prismaMock.customers.findFirst.mockResolvedValue({
      id: BigInt(1),
      company_id: BigInt(1),
      document_number: '12345678000199',
    });

    await expect(
      service.create(
        {
          name: 'Cliente Teste',
          document_number: '12345678000199',
        } as any,
        BigInt(1),
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('deve permitir o mesmo documento em empresas diferentes', async () => {
    prismaMock.customers.findFirst.mockResolvedValue(null);

    prismaMock.customers.create.mockResolvedValue({
      id: BigInt(2),
      company_id: BigInt(2),
      name: 'Cliente Empresa 2',
      document_number: '12345678000199',
    });

    const result = await service.create(
      {
        name: 'Cliente Empresa 2',
        document_number: '12345678000199',
      } as any,
      BigInt(2),
    );

    expect(result).toBeDefined();
  });
});
