import { Test, TestingModule } from '@nestjs/testing';
import { ChartAccountTemplatesController } from './chart-account-templates.controller.js';

describe('ChartAccountTemplatesController', () => {
  let controller: ChartAccountTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartAccountTemplatesController],
    }).compile();

    controller = module.get<ChartAccountTemplatesController>(ChartAccountTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
