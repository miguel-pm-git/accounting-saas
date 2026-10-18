import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';

import { Request as ExpressRequest } from 'express';

import { JournalEntriesService } from './journal-entries.service.js';

import { CreateJournalEntryDto } from './dto/create-journal-entry.dto.js';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto.js';

interface AuthRequest extends ExpressRequest {
  user: {
    sub: string;
    companyId: string;
  };
}

@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(@Body() dto: CreateJournalEntryDto, @Request() req: AuthRequest) {
    return this.journalEntriesService.create(
      dto,
      BigInt(req.user.companyId),
      BigInt(req.user.sub),
    );
  }

  @Post(':id/post')
post(
  @Param('id') id: string,
  @Request() req: AuthRequest,
) {
  return this.journalEntriesService.post(
    BigInt(id),
    BigInt(req.user.companyId),
  );
}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.journalEntriesService.findAll(BigInt(req.user.companyId));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.journalEntriesService.findOne(
      BigInt(id),
      BigInt(req.user.companyId),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJournalEntryDto,
    @Request() req: AuthRequest,
  ) {
    return this.journalEntriesService.update(
      BigInt(id),
      BigInt(req.user.companyId),
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.journalEntriesService.remove(
      BigInt(id),
      BigInt(req.user.companyId),
    );
  }
}
