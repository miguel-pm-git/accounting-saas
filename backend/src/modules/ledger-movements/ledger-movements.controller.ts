import { Controller, Get, Param, Query, Request } from '@nestjs/common';

import { Request as ExpressRequest } from 'express';

import { LedgerMovementsService } from './ledger-movements.service.js';

import { LedgerFilterDto } from './dto/ledger-filter.dto.js';

interface AuthRequest extends ExpressRequest {
  user: {
    companyId: string;
  };
}

@Controller('ledger-movements')
export class LedgerMovementsController {
  constructor(
    private readonly ledgerMovementsService: LedgerMovementsService,
  ) {}

  @Get()
  findAll(@Request() req: AuthRequest, @Query() filter: LedgerFilterDto) {
    return this.ledgerMovementsService.findAll(
      BigInt(req.user.companyId),
      filter,
    );
  }

  @Get('account/:accountId')
  findByAccount(
    @Request() req: AuthRequest,
    @Param('accountId') accountId: string,
  ) {
    return this.ledgerMovementsService.findByAccount(
      BigInt(req.user.companyId),
      BigInt(accountId),
    );
  }

  @Get('account/:accountId/balance')
  getBalance(
    @Request() req: AuthRequest,
    @Param('accountId') accountId: string,
  ) {
    return this.ledgerMovementsService.getBalance(
      BigInt(req.user.companyId),
      BigInt(accountId),
    );
  }

  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.ledgerMovementsService.findOne(
      BigInt(id),
      BigInt(req.user.companyId),
    );
  }
}
