import {
  Controller, Get, Post, Patch, Param, Body, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  async create(@Body() dto: CreateJobDto, @CurrentUser('id') userId: string) {
    return this.jobsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List jobs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.jobsService.findAll(+page, +limit, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job details' })
  async update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign a worker to a job' })
  async assign(@Param('id') id: string, @Body('worker_id') workerId: string) {
    return this.jobsService.assign(id, workerId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark job as completed' })
  async complete(@Param('id') id: string) {
    return this.jobsService.complete(id);
  }
}
