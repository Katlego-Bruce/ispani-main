import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // TODO: Add modules as they are built
    // TypeOrmModule.forRoot({...}),
    // AuthModule,
    // UsersModule,
    // JobsModule,
    // EscrowModule,
    // WalletModule,
  ],
})
export class AppModule {}
