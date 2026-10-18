import { Test, TestingModule } from '@nestjs/testing';
import { CompanyAccountsService } from './company-accounts.service.js';

describe('CompanyAccountsService', () => {
  let service: CompanyAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyAccountsService],
    }).compile();

    service = module.get<CompanyAccountsService>(CompanyAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
