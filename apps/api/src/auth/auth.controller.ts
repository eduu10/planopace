import { Controller, Post, Body, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response, Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login com email e senha' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async refresh(@Req() req: Request) {
    const user = req.user as { userId: string; email: string };
    return this.authService.refreshToken(user.userId);
  }

  @Get('strava')
  @ApiOperation({ summary: 'Iniciar OAuth Strava' })
  async stravaAuth(@Res() res: Response) {
    const url = this.authService.getStravaAuthUrl();
    res.redirect(url);
  }

  @Get('strava/callback')
  @ApiOperation({ summary: 'Callback OAuth Strava' })
  async stravaCallback(@Query('code') code: string, @Res() res: Response) {
    await this.authService.handleStravaCallback(code);
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/dashboard');
  }

  @Get('strava/webhook')
  @ApiOperation({ summary: 'Verificação webhook Strava' })
  async stravaWebhookVerify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.authService.verifyStravaWebhook(mode, verifyToken, challenge);
  }

  @Post('strava/webhook')
  @ApiOperation({ summary: 'Receber evento webhook Strava' })
  async stravaWebhookEvent(@Body() body: Record<string, unknown>) {
    await this.authService.handleStravaWebhookEvent(body);
    return { status: 'ok' };
  }
}
