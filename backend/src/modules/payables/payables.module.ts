import { Module } from '@nestjs/common';
import { PayablesService } from './payables.service.js';
import { PayablesController } from './payables.controller.js';

@Module({
  controllers: [PayablesController],
  providers: [PayablesService],
})
export class PayablesModule {}
