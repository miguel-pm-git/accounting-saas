import { Test, TestingModule } from '@nestjs/testing';
import { ReceivablesService } from './receivables.service.js';

describe('ReceivablesService', () => {
  let service: ReceivablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceivablesService],
    }).compile();

    service = module.get<ReceivablesService>(ReceivablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
