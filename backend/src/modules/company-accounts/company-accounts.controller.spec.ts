import { Test, TestingModule } from '@nestjs/testing';
import { CompanyAccountsController } from './company-accounts.controller.js';

describe('CompanyAccountsController', () => {
  let controller: CompanyAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyAccountsController],
    }).compile();

    controller = module.get<CompanyAccountsController>(CompanyAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
