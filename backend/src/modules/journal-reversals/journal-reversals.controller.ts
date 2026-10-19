import { Body, Controller, Param, Post, Request } from '@nestjs/common';

import { Request as ExpressRequest } from 'express';

import { JournalReversalsService } from './journal-reversals.service.js';
import { CreateReversalDto } from './dto/create-reversal.dto.js';

interface AuthRequest extends ExpressRequest {
  user: {
    sub: string;
    companyId: string;
  };
}

@Controller('journal-reversals')
export class JournalReversalsController {
  constructor(private readonly service: JournalReversalsService) {}

  @Post(':entryId')
  reverse(
    @Param('entryId') entryId: string,
    @Body() dto: CreateReversalDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.reverse(
      BigInt(entryId),
      BigInt(req.user.sub),
      dto.reason,
    );
  }
}
