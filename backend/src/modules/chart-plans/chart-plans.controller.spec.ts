import { Test, TestingModule } from '@nestjs/testing';
import { ChartPlansController } from './chart-plans.controller.js';

describe('ChartPlansController', () => {
  let controller: ChartPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartPlansController],
    }).compile();

    controller = module.get<ChartPlansController>(ChartPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
