import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RunsService } from './runs.service';
import { CreateRunDto, ListRunsQueryDto } from './runs.dto';
import type { Request } from 'express';

@ApiTags('Runs')
@Controller('runs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar corridas' })
  async list(@Req() req: Request, @Query() query: ListRunsQueryDto) {
    const user = req.user as { userId: string };
    return this.runsService.list(user.userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas agregadas' })
  async stats(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.runsService.getStats(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma corrida' })
  async findOne(@Param('id') id: string) {
    return this.runsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar corrida manual' })
  async create(@Req() req: Request, @Body() dto: CreateRunDto) {
    const user = req.user as { userId: string };
    return this.runsService.create(user.userId, dto);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync manual com Strava' })
  async sync(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.runsService.syncStrava(user.userId);
  }
}
