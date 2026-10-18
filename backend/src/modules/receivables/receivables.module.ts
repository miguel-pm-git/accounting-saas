import { Module } from '@nestjs/common';
import { ReceivablesService } from './receivables.service.js';
import { ReceivablesController } from './receivables.controller.js';

@Module({
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
})
export class ReceivablesModule {}
