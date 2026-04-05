import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletService } from '../wallet.service';
import { Wallet } from '../../entities/wallet.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';

const mockWalletRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockLedgerRepo = {
  findAndCount: jest.fn(),
};

const mockManager = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn((cb) => cb(mockManager)),
};

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: mockWalletRepo },
        { provide: getRepositoryToken(LedgerEntry), useValue: mockLedgerRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const wallet = {
        id: 'w1', user_id: 'u1', available_balance: 1000,
        held_balance: 200, pending_balance: 0, currency: 'ZAR', is_active: true,
      };
      mockWalletRepo.findOne.mockResolvedValue(wallet);

      const result = await service.getBalance('u1');
      expect(result.available_balance).toBe(1000);
      expect(result.held_balance).toBe(200);
      expect(result.total_balance).toBe(1200);
      expect(result.currency).toBe('ZAR');
    });

    it('should auto-create wallet if none exists', async () => {
      mockWalletRepo.findOne.mockResolvedValue(null);
      mockWalletRepo.create.mockReturnValue({ id: 'new', user_id: 'u1', available_balance: 0, held_balance: 0, pending_balance: 0, currency: 'ZAR', is_active: true });
      mockWalletRepo.save.mockResolvedValue({ id: 'new', user_id: 'u1', available_balance: 0, held_balance: 0, pending_balance: 0, currency: 'ZAR', is_active: true });

      const result = await service.getBalance('u1');
      expect(result.available_balance).toBe(0);
      expect(mockWalletRepo.create).toHaveBeenCalled();
    });
  });

  describe('credit', () => {
    it('should reject non-positive amounts', async () => {
      await expect(service.credit('u1', 0, 'deposit')).rejects.toThrow(BadRequestException);
      await expect(service.credit('u1', -100, 'deposit')).rejects.toThrow(BadRequestException);
    });

    it('should credit wallet and create ledger entry', async () => {
      const wallet = { id: 'w1', user_id: 'u1', available_balance: 500, is_active: true };
      mockManager.findOne.mockResolvedValue(wallet);
      mockManager.create.mockReturnValue({ id: 'le1', amount: 200 });
      mockManager.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.credit('u1', 200, 'deposit');
      expect(wallet.available_balance).toBe(700);
    });
  });

  describe('debit', () => {
    it('should reject insufficient balance', async () => {
      const wallet = { id: 'w1', user_id: 'u1', available_balance: 100, is_active: true };
      mockManager.findOne.mockResolvedValue(wallet);

      await expect(service.debit('u1', 500, 'escrow_fund')).rejects.toThrow(BadRequestException);
    });

    it('should reject inactive wallet', async () => {
      const wallet = { id: 'w1', user_id: 'u1', available_balance: 1000, is_active: false };
      mockManager.findOne.mockResolvedValue(wallet);

      await expect(service.debit('u1', 100, 'escrow_fund')).rejects.toThrow(BadRequestException);
    });
  });
});
