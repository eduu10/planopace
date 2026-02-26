import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'database';
import { CreateRunDto, ListRunsQueryDto } from './runs.dto';

const prisma = new PrismaClient();

@Injectable()
export class RunsService {
  async list(userId: string, query: ListRunsQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const where: Record<string, unknown> = { userId };

    if (query.startDate || query.endDate) {
      where['date'] = {};
      if (query.startDate) (where['date'] as Record<string, unknown>)['gte'] = new Date(query.startDate);
      if (query.endDate) (where['date'] as Record<string, unknown>)['lte'] = new Date(query.endDate);
    }
    if (query.type) where['type'] = query.type;

    const [runs, total] = await Promise.all([
      prisma.run.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.run.count({ where }),
    ]);

    return { runs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const run = await prisma.run.findUnique({ where: { id } });
    if (!run) throw new NotFoundException('Corrida não encontrada');
    return run;
  }

  async create(userId: string, dto: CreateRunDto) {
    return prisma.run.create({
      data: {
        userId,
        date: new Date(dto.date),
        distanceKm: dto.distanceKm,
        durationSeconds: dto.durationSeconds,
        paceAvg: dto.paceAvg,
        paceMax: dto.paceMax,
        heartRateAvg: dto.heartRateAvg,
        heartRateMax: dto.heartRateMax,
        type: (dto.type as 'EASY' | 'INTERVALS' | 'TEMPO' | 'LONG_RUN' | 'REST' | 'RACE' | 'TEST') || 'EASY',
        source: 'manual',
        notes: dto.notes,
      },
    });
  }

  async getStats(userId: string) {
    const runs = await prisma.run.findMany({ where: { userId } });
    if (runs.length === 0) {
      return { totalRuns: 0, totalKm: 0, avgPace: 0, totalDurationMin: 0 };
    }

    const totalKm = runs.reduce((sum, r) => sum + r.distanceKm, 0);
    const totalSeconds = runs.reduce((sum, r) => sum + r.durationSeconds, 0);
    const avgPace = runs.reduce((sum, r) => sum + r.paceAvg, 0) / runs.length;

    return {
      totalRuns: runs.length,
      totalKm: Math.round(totalKm * 100) / 100,
      avgPace: Math.round(avgPace * 100) / 100,
      totalDurationMin: Math.round(totalSeconds / 60),
    };
  }

  async syncStrava(userId: string) {
    const stravaAccount = await prisma.stravaAccount.findUnique({ where: { userId } });
    if (!stravaAccount) throw new NotFoundException('Conta Strava não conectada');

    // Refresh token if expired
    let accessToken = stravaAccount.accessToken;
    if (stravaAccount.expiresAt < Math.floor(Date.now() / 1000)) {
      const refreshRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: stravaAccount.refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      const refreshData = await refreshRes.json() as { access_token: string; refresh_token: string; expires_at: number };
      accessToken = refreshData.access_token;
      await prisma.stravaAccount.update({
        where: { id: stravaAccount.id },
        data: {
          accessToken: refreshData.access_token,
          refreshToken: refreshData.refresh_token,
          expiresAt: refreshData.expires_at,
        },
      });
    }

    // Fetch recent activities
    const activitiesRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const activities = await activitiesRes.json() as Array<{
      id: number;
      type: string;
      start_date: string;
      distance: number;
      moving_time: number;
      average_speed: number;
      max_speed: number;
      average_heartrate?: number;
      max_heartrate?: number;
      average_cadence?: number;
      total_elevation_gain: number;
      calories: number;
      map?: { summary_polyline?: string };
      splits_metric?: unknown[];
    }>;

    let synced = 0;
    for (const activity of activities) {
      if (activity.type !== 'Run') continue;

      const distanceKm = activity.distance / 1000;
      const paceAvg = distanceKm > 0 ? (activity.moving_time / 60) / distanceKm : 0;
      const paceMax = activity.max_speed > 0 ? 1000 / (activity.max_speed * 60) : undefined;

      await prisma.run.upsert({
        where: { stravaActivityId: BigInt(activity.id) },
        update: {},
        create: {
          userId,
          stravaActivityId: BigInt(activity.id),
          date: new Date(activity.start_date),
          distanceKm: Math.round(distanceKm * 100) / 100,
          durationSeconds: activity.moving_time,
          paceAvg: Math.round(paceAvg * 100) / 100,
          paceMax: paceMax ? Math.round(paceMax * 100) / 100 : undefined,
          heartRateAvg: activity.average_heartrate ? Math.round(activity.average_heartrate) : undefined,
          heartRateMax: activity.max_heartrate ? Math.round(activity.max_heartrate) : undefined,
          cadenceAvg: activity.average_cadence ? Math.round(activity.average_cadence) : undefined,
          elevationGain: activity.total_elevation_gain,
          calories: activity.calories,
          source: 'strava',
          polyline: activity.map?.summary_polyline,
          splits: activity.splits_metric as object | undefined,
        },
      });
      synced++;
    }

    return { synced, message: `${synced} corridas sincronizadas do Strava` };
  }
}
