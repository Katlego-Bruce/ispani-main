import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { JobsService } from '../jobs.service';
import { Job } from '../../entities/job.entity';

const mockJobRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: mockJobRepo },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job', async () => {
      const dto = {
        organization_id: 'org-1',
        title: 'Test Job',
        description: 'Test',
        payment_amount: 500,
      };
      const created = { ...dto, id: 'job-1', client_id: 'user-1', status: 'open' };
      mockJobRepo.create.mockReturnValue(created);
      mockJobRepo.save.mockResolvedValue(created);

      const result = await service.create(dto, 'user-1');
      expect(result.status).toBe('open');
      expect(result.client_id).toBe('user-1');
    });
  });

  describe('assign', () => {
    it('should assign a worker to an open job', async () => {
      const job = { id: 'job-1', status: 'open', worker_id: null };
      mockJobRepo.findOne.mockResolvedValue(job);
      mockJobRepo.save.mockResolvedValue({ ...job, worker_id: 'worker-1', status: 'assigned' });

      const result = await service.assign('job-1', 'worker-1');
      expect(result.status).toBe('assigned');
    });

    it('should throw if job is not open', async () => {
      mockJobRepo.findOne.mockResolvedValue({ id: 'job-1', status: 'completed' });

      await expect(
        service.assign('job-1', 'worker-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete an assigned job', async () => {
      const job = { id: 'job-1', status: 'assigned' };
      mockJobRepo.findOne.mockResolvedValue(job);
      mockJobRepo.save.mockResolvedValue({ ...job, status: 'completed' });

      const result = await service.complete('job-1');
      expect(result.status).toBe('completed');
    });
  });
});
