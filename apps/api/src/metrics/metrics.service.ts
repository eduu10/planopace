import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'database';

const prisma = new PrismaClient();

@Injectable()
export class MetricsService {
  // VDOT calculation based on Jack Daniels formula
  calculateVdot(distanceMeters: number, timeSeconds: number): number {
    const velocity = distanceMeters / (timeSeconds / 60); // meters per minute
    const vdot = -4.6 + 0.182258 * velocity + 0.000104 * velocity * velocity;
    return Math.round(vdot * 10) / 10;
  }

  // Simplified TSS for running
  calculateTss(durationMin: number, paceAvg: number, thresholdPace: number): number {
    const intensity = thresholdPace / paceAvg;
    return Math.round((durationMin * intensity * intensity) / 36 * 100);
  }

  async getEvolution(userId: string) {
    return prisma.metricSnapshot.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: 90,
    });
  }

  async getCurrent(userId: string) {
    const snapshot = await prisma.metricSnapshot.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    if (!snapshot) throw new NotFoundException('Nenhuma métrica encontrada');
    return snapshot;
  }

  async calculateMetrics(userId: string) {
    const runs = await prisma.run.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    if (runs.length === 0) return { message: 'Nenhuma corrida para calcular métricas' };

    // Find best run for VDOT estimation
    const bestRun = runs.reduce((best, run) => {
      if (!best || run.paceAvg < best.paceAvg) return run;
      return best;
    });

    const vdot = this.calculateVdot(bestRun.distanceKm * 1000, bestRun.durationSeconds);

    // Estimate threshold pace from VDOT (simplified)
    const thresholdPace = 4.6 + (60 - vdot) * 0.05;

    // Calculate daily TSS values
    const dailyTss: Record<string, number> = {};
    for (const run of runs) {
      const dateKey = run.date.toISOString().split('T')[0];
      const tss = this.calculateTss(run.durationSeconds / 60, run.paceAvg, thresholdPace);
      dailyTss[dateKey] = (dailyTss[dateKey] || 0) + tss;
    }

    // Calculate CTL (42-day EMA), ATL (7-day EMA)
    const sortedDates = Object.keys(dailyTss).sort();
    let ctl = 0;
    let atl = 0;

    for (const date of sortedDates) {
      const tss = dailyTss[date];
      ctl = ctl + (tss - ctl) / 42;
      atl = atl + (tss - atl) / 7;
    }

    const tsb = ctl - atl;

    // Calculate weekly stats
    const lastWeekRuns = runs.filter(
      (r) => r.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    );
    const weeklyKm = lastWeekRuns.reduce((sum, r) => sum + r.distanceKm, 0);
    const avgPace = lastWeekRuns.length > 0
      ? lastWeekRuns.reduce((sum, r) => sum + r.paceAvg, 0) / lastWeekRuns.length
      : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await prisma.metricSnapshot.upsert({
      where: { userId_date: { userId, date: today } },
      update: { ctl, atl, tsb, weeklyKm, avgPace, vdot, runCount: lastWeekRuns.length },
      create: { userId, date: today, ctl, atl, tsb, weeklyKm, avgPace, vdot, runCount: lastWeekRuns.length },
    });

    return snapshot;
  }
}
