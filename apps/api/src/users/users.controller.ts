import { Controller, Get, Patch, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateProfileDto } from './users.dto';
import type { Request } from 'express';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário logado' })
  async getMe(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.usersService.findById(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  async updateMe(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = req.user as { userId: string };
    return this.usersService.update(user.userId, dto);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Perfil do atleta' })
  async getProfile(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.usersService.getAthleteProfile(user.userId);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Criar/atualizar perfil do atleta' })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as { userId: string };
    return this.usersService.upsertAthleteProfile(user.userId, dto);
  }
}
