import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';

import { JournalEntriesController } from './journal-entries.controller.js';
import { JournalEntriesService } from './journal-entries.service.js';

describe('JournalEntriesController', () => {
  let controller: JournalEntriesController;

  const serviceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalEntriesController],
      providers: [
        {
          provide: JournalEntriesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<JournalEntriesController>(JournalEntriesController);
  });

  it('deve criar lançamento', async () => {
    const dto = {
      entry_date: '2026-10-17',
      description: 'Teste',
      items: [],
    };

    const req: any = {
      user: {
        sub: '1',
        companyId: '10',
      },
    };

    serviceMock.create.mockResolvedValue({
      id: BigInt(1),
    });

    const result = await controller.create(dto as any, req);

    expect(serviceMock.create).toHaveBeenCalledWith(dto, BigInt(10), BigInt(1));

    expect(result.id).toBe(BigInt(1));
  });

  it('deve listar lançamentos', async () => {
    const req: any = {
      user: {
        companyId: '10',
      },
    };

    serviceMock.findAll.mockResolvedValue([]);

    await controller.findAll(req);

    expect(serviceMock.findAll).toHaveBeenCalledWith(BigInt(10));
  });

  it('deve buscar lançamento por id', async () => {
    const req: any = {
      user: {
        companyId: '10',
      },
    };

    serviceMock.findOne.mockResolvedValue({
      id: BigInt(1),
    });

    await controller.findOne('1', req);

    expect(serviceMock.findOne).toHaveBeenCalledWith(BigInt(1), BigInt(10));
  });

  it('deve atualizar lançamento', async () => {
    const req: any = {
      user: {
        companyId: '10',
      },
    };

    const dto = {
      description: 'Atualizado',
    };

    serviceMock.update.mockResolvedValue({
      id: BigInt(1),
    });

    await controller.update('1', dto as any, req);

    expect(serviceMock.update).toHaveBeenCalledWith(BigInt(1), BigInt(10), dto);
  });

  it('deve remover lançamento', async () => {
    const req: any = {
      user: {
        companyId: '10',
      },
    };

    serviceMock.remove.mockResolvedValue({
      id: BigInt(1),
    });

    await controller.remove('1', req);

    expect(serviceMock.remove).toHaveBeenCalledWith(BigInt(1), BigInt(10));
  });
});
