import { Test, TestingModule } from '@nestjs/testing';
import { CashMovementsController } from './cash-movements.controller.js';
import { CashMovementsService } from './cash-movements.service.js';

describe('CashMovementsController', () => {
  let controller: CashMovementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashMovementsController],
      providers: [CashMovementsService],
    }).compile();

    controller = module.get<CashMovementsController>(CashMovementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
