import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from 'database';
import { RegisterDto, LoginDto } from './auth.dto';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashedPassword,
      },
    });

    const token = this.generateToken(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.generateToken(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  async refreshToken(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    const token = this.generateToken(user.id, user.email);
    return { token };
  }

  getStravaAuthUrl(): string {
    const clientId = this.configService.get<string>('STRAVA_CLIENT_ID');
    const redirectUri = this.configService.get<string>('STRAVA_REDIRECT_URI');
    return `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=read,activity:read_all&approval_prompt=auto`;
  }

  async handleStravaCallback(code: string) {
    const clientId = this.configService.get<string>('STRAVA_CLIENT_ID');
    const clientSecret = this.configService.get<string>('STRAVA_CLIENT_SECRET');

    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json() as {
      athlete: { id: number };
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };

    await prisma.stravaAccount.upsert({
      where: { stravaId: data.athlete.id },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      },
      create: {
        stravaId: data.athlete.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        userId: '', // Will need to be associated with logged-in user
      },
    });

    return data;
  }

  verifyStravaWebhook(mode: string, verifyToken: string, challenge: string) {
    const expected = this.configService.get<string>('STRAVA_WEBHOOK_VERIFY_TOKEN');
    if (mode === 'subscribe' && verifyToken === expected) {
      return { 'hub.challenge': challenge };
    }
    throw new UnauthorizedException('Webhook verification failed');
  }

  async handleStravaWebhookEvent(body: Record<string, unknown>) {
    if (body['object_type'] === 'activity' && body['aspect_type'] === 'create') {
      // TODO: Fetch activity details and save as Run
      console.log('Strava activity created:', body['object_id']);
    }
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}
