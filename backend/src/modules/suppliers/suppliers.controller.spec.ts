import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { SuppliersService } from './suppliers.service.js';

describe('SuppliersService', () => {
  let service: SuppliersService;

  const prismaMock = {
    suppliers: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();

    service = new SuppliersService(prismaMock as any);
  });

  describe('create', () => {
    it('deve criar um fornecedor', async () => {
      prismaMock.suppliers.findFirst.mockResolvedValue(null);

      prismaMock.suppliers.create.mockResolvedValue({
        id: BigInt(1),
        company_id: BigInt(1),
        name: 'Fornecedor Teste',
        document_number: '12345678000199',
        email: 'teste@teste.com',
      });

      const result = await service.create(BigInt(1), {
        name: 'Fornecedor Teste',
        document_number: '12345678000199',
        email: 'teste@teste.com',
      });

      expect(prismaMock.suppliers.create).toHaveBeenCalled();

      expect(result.id).toBe('1');
    });

    it('deve impedir documento duplicado na mesma empresa', async () => {
      prismaMock.suppliers.findFirst.mockResolvedValue({
        id: BigInt(1),
        company_id: BigInt(1),
        document_number: '12345678000199',
      });

      await expect(
        service.create(BigInt(1), {
          name: 'Fornecedor Duplicado',
          document_number: '12345678000199',
          email: 'duplicado@teste.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('deve retornar fornecedor existente', async () => {
      prismaMock.suppliers.findFirst.mockResolvedValue({
        id: BigInt(1),
        company_id: BigInt(1),
        name: 'Fornecedor Teste',
        email: 'teste@teste.com',
      });

      const result = await service.findOne(BigInt(1), BigInt(1));

      expect(result.id).toBe('1');
    });

    it('deve lançar erro quando fornecedor não existir', async () => {
      prismaMock.suppliers.findFirst.mockResolvedValue(null);

      await expect(service.findOne(BigInt(999), BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar fornecedor', async () => {
      prismaMock.suppliers.findFirst
        .mockResolvedValueOnce({
          id: BigInt(1),
          company_id: BigInt(1),
        })
        .mockResolvedValueOnce(null);

      prismaMock.suppliers.update.mockResolvedValue({
        id: BigInt(1),
        company_id: BigInt(1),
        name: 'Fornecedor Alterado',
      });

      const result = await service.update(BigInt(1), BigInt(1), {
        name: 'Fornecedor Alterado',
      });

      expect(result.name).toBe('Fornecedor Alterado');
    });

    it('deve impedir alteração para documento já existente', async () => {
      prismaMock.suppliers.findFirst
        .mockResolvedValueOnce({
          id: BigInt(1),
          company_id: BigInt(1),
        })
        .mockResolvedValueOnce({
          id: BigInt(2),
          company_id: BigInt(1),
          document_number: '12345678000199',
        });

      await expect(
        service.update(BigInt(1), BigInt(1), {
          document_number: '12345678000199',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover fornecedor', async () => {
      prismaMock.suppliers.findFirst.mockResolvedValue({
        id: BigInt(1),
        company_id: BigInt(1),
      });

      prismaMock.suppliers.delete.mockResolvedValue({
        id: BigInt(1),
      });

      const result = await service.remove(BigInt(1), BigInt(1));

      expect(prismaMock.suppliers.delete).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Fornecedor removido com sucesso',
      });
    });

    it('deve lançar erro ao remover fornecedor inexistente', async () => {
      prismaMock.suppliers.findFirst.mockResolvedValue(null);

      await expect(service.remove(BigInt(999), BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
