import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import type { Request } from 'express';

@ApiTags('AI')
@Controller('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-plan')
  @ApiOperation({ summary: 'Gerar plano de treino com IA' })
  async generatePlan(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.aiService.generateTrainingPlan(user.userId);
  }

  @Post('weekly-adjustment')
  @ApiOperation({ summary: 'Ajuste semanal baseado em dados reais (Pro+)' })
  async weeklyAdjustment(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.aiService.weeklyAdjustment(user.userId);
  }

  @Post('insight')
  @ApiOperation({ summary: 'Gerar insight de IA (Elite)' })
  async insight(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.aiService.generateInsight(user.userId);
  }

  @Post('race-prediction')
  @ApiOperation({ summary: 'Previsão de pace para prova (Elite)' })
  async racePrediction(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.aiService.racePrediction(user.userId);
  }
}
