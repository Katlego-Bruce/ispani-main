import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
  ) {}

  async create(dto: CreateJobDto, clientId: string) {
    const job = this.jobRepo.create({
      ...dto,
      client_id: clientId,
      status: 'open',
    });
    return this.jobRepo.save(job);
  }

  async findAll(page: number, limit: number, status?: string) {
    const query = this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.client', 'client')
      .leftJoinAndSelect('job.worker', 'worker')
      .orderBy('job.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.where('job.status = :status', { status });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['client', 'worker', 'organization'],
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    const job = await this.findOne(id);
    Object.assign(job, dto);
    return this.jobRepo.save(job);
  }

  async assign(id: string, workerId: string) {
    const job = await this.findOne(id);
    if (job.status !== 'open') {
      throw new BadRequestException('Job is not open for assignment');
    }
    job.worker_id = workerId;
    job.status = 'assigned';
    return this.jobRepo.save(job);
  }

  async complete(id: string) {
    const job = await this.findOne(id);
    if (!['assigned', 'in_progress'].includes(job.status)) {
      throw new BadRequestException('Job cannot be completed in current state');
    }
    job.status = 'completed';
    return this.jobRepo.save(job);
  }
}
