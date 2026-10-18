import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

import { JournalReversalsController } from './journal-reversals.controller.js';
import { JournalReversalsService } from './journal-reversals.service.js';

@Module({
  controllers: [JournalReversalsController],
  providers: [JournalReversalsService, PrismaService],
})
export class JournalReversalsModule {}
