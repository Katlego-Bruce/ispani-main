import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from '../entities/wallet.entity';
import { LedgerEntry } from '../entities/ledger-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, LedgerEntry])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
