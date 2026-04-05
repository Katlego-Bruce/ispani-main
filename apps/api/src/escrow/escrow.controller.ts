import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('escrow')
@Controller('escrow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post()
  @ApiOperation({ summary: 'Create escrow for a job' })
  async create(
    @Body('job_id') jobId: string,
    @Body('amount') amount: number,
    @Body('recipient_id') recipientId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.escrowService.create(jobId, userId, amount, recipientId);
  }

  @Patch(':id/fund')
  @ApiOperation({ summary: 'Fund an escrow (debit funder wallet)' })
  async fund(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.escrowService.fund(id, userId);
  }

  @Patch(':id/release')
  @ApiOperation({ summary: 'Release escrow to worker (credit recipient)' })
  async release(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.escrowService.release(id, userId);
  }

  @Patch(':id/refund')
  @ApiOperation({ summary: 'Refund escrow to funder' })
  async refund(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.escrowService.refund(id, userId);
  }

  @Patch(':id/dispute')
  @ApiOperation({ summary: 'Dispute an escrow' })
  async dispute(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.escrowService.dispute(id, userId, reason);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get escrow details' })
  async findOne(@Param('id') id: string) {
    return this.escrowService.findOne(id);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get escrow by job ID' })
  async findByJob(@Param('jobId') jobId: string) {
    return this.escrowService.findByJob(jobId);
  }
}
