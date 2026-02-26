import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MetricsService } from './metrics.service';
import type { Request } from 'express';

@ApiTags('Metrics')
@Controller('metrics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('evolution')
  @ApiOperation({ summary: 'Série temporal de métricas' })
  async evolution(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.metricsService.getEvolution(user.userId);
  }

  @Get('current')
  @ApiOperation({ summary: 'Snapshot mais recente' })
  async current(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.metricsService.getCurrent(user.userId);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Recalcular métricas' })
  async calculate(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.metricsService.calculateMetrics(user.userId);
  }
}
