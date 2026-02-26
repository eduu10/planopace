import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RunsModule } from './runs/runs.module';
import { TrainingModule } from './training/training.module';
import { MetricsModule } from './metrics/metrics.module';
import { AiModule } from './ai/ai.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    RunsModule,
    TrainingModule,
    MetricsModule,
    AiModule,
    BillingModule,
  ],
})
export class AppModule {}
