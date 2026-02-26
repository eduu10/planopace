import { Controller, Get, Post, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainingService } from './training.service';
import type { Request } from 'express';

@ApiTags('Training')
@Controller('training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Gerar plano mensal com IA' })
  async generate(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.trainingService.generatePlan(user.userId);
  }

  @Get('current')
  @ApiOperation({ summary: 'Plano ativo atual' })
  async current(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.trainingService.getCurrentPlan(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do plano' })
  async findOne(@Param('id') id: string) {
    return this.trainingService.findById(id);
  }

  @Get(':id/weeks')
  @ApiOperation({ summary: 'Semanas do plano' })
  async getWeeks(@Param('id') id: string) {
    return this.trainingService.getWeeks(id);
  }

  @Get(':id/weeks/:weekId')
  @ApiOperation({ summary: 'Workouts da semana' })
  async getWeekWorkouts(@Param('weekId') weekId: string) {
    return this.trainingService.getWeekWorkouts(weekId);
  }

  @Patch('workouts/:id/complete')
  @ApiOperation({ summary: 'Marcar workout como concluído' })
  async completeWorkout(@Param('id') id: string) {
    return this.trainingService.completeWorkout(id);
  }
}
