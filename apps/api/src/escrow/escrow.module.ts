import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { Escrow } from '../entities/escrow.entity';
import { EscrowEvent } from '../entities/escrow-event.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Escrow, EscrowEvent]),
    WalletModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}
