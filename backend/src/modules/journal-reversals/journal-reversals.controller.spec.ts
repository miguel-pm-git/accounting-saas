import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JournalReversalsController } from './journal-reversals.controller.js';
import { JournalReversalsService } from './journal-reversals.service.js';

import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('JournalReversalsController', () => {
  let controller: JournalReversalsController;

  const serviceMock = {
    reverse: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalReversalsController],
      providers: [
        {
          provide: JournalReversalsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<JournalReversalsController>(
      JournalReversalsController,
    );
  });

  describe('reverse', () => {
    it('deve encaminhar os parâmetros corretamente para o service', async () => {
      const req: any = {
        user: {
          sub: '1',
          companyId: '10',
        },
      };

      const dto = {
        reason: 'Lançamento realizado em conta incorreta',
      };

      serviceMock.reverse.mockResolvedValue({
        reversal: {
          id: BigInt(100),
        },
        reversalEntryId: BigInt(200),
      });

      const result = await controller.reverse('123', dto, req);

      expect(serviceMock.reverse).toHaveBeenCalledWith(
        BigInt(123),
        BigInt(10),
        BigInt(1),
        dto.reason,
      );

      expect(result).toEqual({
        reversal: {
          id: BigInt(100),
        },
        reversalEntryId: BigInt(200),
      });
    });

    it('deve permitir motivo com tamanho máximo suportado', async () => {
      const req: any = {
        user: {
          sub: '1',
          companyId: '10',
        },
      };

      const dto = {
        reason: 'x'.repeat(500),
      };

      serviceMock.reverse.mockResolvedValue({
        reversal: {
          id: BigInt(1),
        },
        reversalEntryId: BigInt(2),
      });

      await controller.reverse('1', dto, req);

      expect(serviceMock.reverse).toHaveBeenCalledOnce();
    });

    it('deve converter entryId para bigint', async () => {
      const req: any = {
        user: {
          sub: '5',
          companyId: '20',
        },
      };

      serviceMock.reverse.mockResolvedValue({
        reversal: {
          id: BigInt(1),
        },
        reversalEntryId: BigInt(2),
      });

      await controller.reverse(
        '999',
        {
          reason: 'Teste',
        },
        req,
      );

      expect(serviceMock.reverse).toHaveBeenCalledWith(
        BigInt(999),
        BigInt(20),
        BigInt(5),
        'Teste',
      );
    });

    it('deve propagar NotFoundException do service', async () => {
      const req: any = {
        user: {
          sub: '1',
          companyId: '10',
        },
      };

      serviceMock.reverse.mockRejectedValue(
        new NotFoundException('Lançamento não encontrado.'),
      );

      await expect(
        controller.reverse(
          '999',
          {
            reason: 'Teste',
          },
          req,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve propagar erro para lançamento não contabilizado', async () => {
      const req: any = {
        user: {
          sub: '1',
          companyId: '10',
        },
      };

      serviceMock.reverse.mockRejectedValue(
        new BadRequestException(
          'Somente lançamentos contabilizados podem ser estornados.',
        ),
      );

      await expect(
        controller.reverse(
          '1',
          {
            reason: 'Teste',
          },
          req,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve propagar erro quando lançamento já estiver estornado', async () => {
      const req: any = {
        user: {
          sub: '1',
          companyId: '10',
        },
      };

      serviceMock.reverse.mockRejectedValue(
        new BadRequestException('Lançamento já estornado.'),
      );

      await expect(
        controller.reverse(
          '1',
          {
            reason: 'Duplicado',
          },
          req,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve propagar erros inesperados do service', async () => {
      const req: any = {
        user: {
          sub: '1',
          companyId: '10',
        },
      };

      const unexpectedError = new Error('Falha inesperada no banco de dados');

      serviceMock.reverse.mockRejectedValue(unexpectedError);

      await expect(
        controller.reverse(
          '1',
          {
            reason: 'Teste',
          },
          req,
        ),
      ).rejects.toThrow('Falha inesperada no banco de dados');
    });
  });

  it('deve propagar o mesmo objeto de erro recebido do service', async () => {
    const req: any = {
      user: {
        sub: '1',
        companyId: '10',
      },
    };

    const unexpectedError = new Error('Erro desconhecido');

    serviceMock.reverse.mockRejectedValue(unexpectedError);

    try {
      await controller.reverse(
        '1',
        {
          reason: 'Teste',
        },
        req,
      );

      expect.fail('Era esperado que fosse lançada uma exceção');
    } catch (error) {
      expect(error).toBe(unexpectedError);
    }
  });

  it('deve retornar status 404 quando o lançamento não existir', async () => {
    const req: any = {
      user: {
        sub: '1',
        companyId: '10',
      },
    };

    serviceMock.reverse.mockRejectedValue(
      new NotFoundException('Lançamento não encontrado.'),
    );

    try {
      await controller.reverse(
        '999',
        {
          reason: 'Teste',
        },
        req,
      );

      expect.fail('Era esperado lançar exceção');
    } catch (error: any) {
      expect(error.getStatus()).toBe(404);
    }
  });

  it('deve retornar status 400 para lançamento não contabilizado', async () => {
    const req: any = {
      user: {
        sub: '1',
        companyId: '10',
      },
    };

    serviceMock.reverse.mockRejectedValue(
      new BadRequestException(
        'Somente lançamentos contabilizados podem ser estornados.',
      ),
    );

    try {
      await controller.reverse(
        '1',
        {
          reason: 'Teste',
        },
        req,
      );

      expect.fail('Era esperado lançar exceção');
    } catch (error: any) {
      expect(error.getStatus()).toBe(400);
    }
  });

  it('deve retornar status e mensagem corretos', async () => {
    const req: any = {
      user: {
        sub: '1',
        companyId: '10',
      },
    };

    serviceMock.reverse.mockRejectedValue(
      new BadRequestException('Lançamento já estornado.'),
    );

    try {
      await controller.reverse(
        '1',
        {
          reason: 'Teste',
        },
        req,
      );

      expect.fail('Era esperado lançar exceção');
    } catch (error: any) {
      expect(error.getStatus()).toBe(400);

      expect(error.getResponse()).toEqual({
        message: 'Lançamento já estornado.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }
  });

  it('deve propagar erro interno inesperado', async () => {
    const req: any = {
      user: {
        sub: '1',
        companyId: '10',
      },
    };

    serviceMock.reverse.mockRejectedValue(new Error('Erro interno inesperado'));

    await expect(
      controller.reverse(
        '1',
        {
          reason: 'Teste',
        },
        req,
      ),
    ).rejects.toThrow('Erro interno inesperado');
  });

  it('deve propagar a mesma instância do erro inesperado', async () => {
    const req: any = {
      user: {
        sub: '1',
        companyId: '10',
      },
    };

    const error = new Error('Falha inesperada no banco');

    serviceMock.reverse.mockRejectedValue(error);

    try {
      await controller.reverse(
        '1',
        {
          reason: 'Teste',
        },
        req,
      );

      expect.fail('Era esperado lançar exceção');
    } catch (err) {
      expect(err).toBe(error);
    }
  });
});
