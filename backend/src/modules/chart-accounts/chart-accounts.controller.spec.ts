import { Test, TestingModule } from '@nestjs/testing';
import { ChartAccountsController } from './chart-accounts.controller.js';
import { ChartAccountsService } from './chart-accounts.service.js';

describe('ChartAccountsController', () => {
  let controller: ChartAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartAccountsController],
      providers: [ChartAccountsService],
    }).compile();

    controller = module.get<ChartAccountsController>(ChartAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
