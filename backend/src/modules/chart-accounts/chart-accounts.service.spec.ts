import { Test, TestingModule } from '@nestjs/testing';
import { ChartAccountsService } from './chart-accounts.service.js';

describe('ChartAccountsService', () => {
  let service: ChartAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartAccountsService],
    }).compile();

    service = module.get<ChartAccountsService>(ChartAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
