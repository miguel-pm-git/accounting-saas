import { Test, TestingModule } from '@nestjs/testing';
import { ReceivablesController } from './receivables.controller.js';
import { ReceivablesService } from './receivables.service.js';

describe('ReceivablesController', () => {
  let controller: ReceivablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceivablesController],
      providers: [ReceivablesService],
    }).compile();

    controller = module.get<ReceivablesController>(ReceivablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
