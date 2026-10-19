import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { PlansController } from './plans.controller.js';
import { PlansService } from './plans.service.js';

@Module({
  controllers: [PlansController],
  providers: [
    PlansService,
    PrismaService,
  ],
  exports: [PlansService],
})
export class PlansModule {}
