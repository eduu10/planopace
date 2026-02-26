import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from 'database';

const prisma = new PrismaClient();

interface GeneratedPlan {
  planSummary: string;
  weeklyIncrease: string;
  weeks: Array<{
    weekNumber: number;
    theme: string;
    totalKm: number;
    tip: string;
    workouts: Array<{
      dayOfWeek: number;
      type: string;
      title: string;
      description: string;
      targetDistanceKm: number | null;
      targetPaceMin: number | null;
      targetPaceMax: number | null;
      targetDurationMin: number | null;
      warmupMin: number | null;
      cooldownMin: number | null;
      intervals: object | null;
    }>;
  }>;
}

@Injectable()
export class AiService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateTrainingPlan(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user || !user.profile) throw new NotFoundException('Perfil do atleta não encontrado');

    const profile = user.profile;

    // Get recent metrics
    const recentMetric = await prisma.metricSnapshot.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const systemPrompt = `Você é um treinador de corrida certificado com 15 anos de experiência em periodização esportiva. Você usa a metodologia VDOT de Jack Daniels para calcular zonas de treino. Responda APENAS em JSON válido, sem markdown, sem explicações.`;

    const userPrompt = `Gere um plano de treino mensal (4 semanas) para este atleta:

PERFIL:
- Idade: ${profile.age || 30} anos
- Pace médio atual: ${profile.currentPace || 6.0} min/km
- VDOT estimado: ${profile.vdot || recentMetric?.vdot || 35}
- Experiência: ${profile.experienceYears || 1} anos de corrida
- Dias disponíveis: ${profile.weeklyDays}/semana
- Objetivo: ${profile.goalType} — ${profile.goalValue || 'melhorar pace'}

HISTÓRICO RECENTE:
- Km/semana médio: ${recentMetric?.weeklyKm || 15}
- Pace médio: ${recentMetric?.avgPace || profile.currentPace || 6.0}
- CTL atual: ${recentMetric?.ctl || 20}
- ATL atual: ${recentMetric?.atl || 15}
- TSB atual: ${recentMetric?.tsb || 5}

Responda com JSON no formato:
{
  "planSummary": "resumo em 2 frases",
  "weeklyIncrease": "percentual de aumento",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "nome da semana",
      "totalKm": 22.5,
      "tip": "dica",
      "workouts": [
        {
          "dayOfWeek": 1,
          "type": "EASY|INTERVALS|TEMPO|LONG_RUN|REST|RACE|TEST",
          "title": "nome curto",
          "description": "descrição detalhada",
          "targetDistanceKm": 5.0,
          "targetPaceMin": 5.40,
          "targetPaceMax": 5.55,
          "targetDurationMin": 30,
          "warmupMin": 10,
          "cooldownMin": 10,
          "intervals": null
        }
      ]
    }
  ]
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
    const generatedPlan = JSON.parse(aiText) as GeneratedPlan;

    // Save to database
    const now = new Date();
    const trainingPlan = await prisma.trainingPlan.create({
      data: {
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        goalType: profile.goalType,
        goalValue: profile.goalValue,
        totalWeeks: 4,
        generatedBy: 'claude',
        aiPromptUsed: userPrompt,
        aiResponseRaw: aiText,
        status: 'active',
      },
    });

    // Create weekly plans and workouts
    for (const week of generatedPlan.weeks) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + (week.weekNumber - 1) * 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const weeklyPlan = await prisma.weeklyPlan.create({
        data: {
          userId,
          trainingPlanId: trainingPlan.id,
          weekNumber: week.weekNumber,
          startDate,
          endDate,
          status: week.weekNumber === 1 ? 'active' : 'upcoming',
        },
      });

      for (const workout of week.workouts) {
        await prisma.workout.create({
          data: {
            weeklyPlanId: weeklyPlan.id,
            dayOfWeek: workout.dayOfWeek,
            type: workout.type as 'EASY' | 'INTERVALS' | 'TEMPO' | 'LONG_RUN' | 'REST' | 'RACE' | 'TEST',
            title: workout.title,
            description: workout.description,
            targetDistanceKm: workout.targetDistanceKm,
            targetPaceMin: workout.targetPaceMin,
            targetPaceMax: workout.targetPaceMax,
            targetDurationMin: workout.targetDurationMin,
            warmupMin: workout.warmupMin,
            cooldownMin: workout.cooldownMin,
            intervals: workout.intervals,
          },
        });
      }
    }

    return trainingPlan;
  }

  async weeklyAdjustment(userId: string) {
    // TODO: Implement weekly adjustment logic
    return { message: 'Ajuste semanal será implementado em breve' };
  }

  async generateInsight(userId: string) {
    const recentMetric = await prisma.metricSnapshot.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const runs = await prisma.run.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: 'Você é um treinador de corrida. Dê um insight curto e motivacional em português brasileiro (2-3 frases).',
      messages: [{
        role: 'user',
        content: `Métricas atuais: CTL=${recentMetric?.ctl || 0}, ATL=${recentMetric?.atl || 0}, TSB=${recentMetric?.tsb || 0}, VDOT=${recentMetric?.vdot || 0}. Últimas corridas: ${runs.map(r => `${r.distanceKm}km em ${r.paceAvg}min/km`).join(', ')}. Dê um insight sobre o estado de forma do atleta.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return { insight: text };
  }

  async racePrediction(userId: string) {
    const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
    const recentMetric = await prisma.metricSnapshot.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: 'Você é um treinador de corrida. Baseado nos dados, preveja tempos de prova. Responda em JSON: { "5k": "MM:SS", "10k": "MM:SS", "halfMarathon": "HH:MM:SS", "marathon": "HH:MM:SS" }',
      messages: [{
        role: 'user',
        content: `VDOT: ${recentMetric?.vdot || profile?.vdot || 35}, Pace médio: ${recentMetric?.avgPace || profile?.currentPace || 6.0} min/km, CTL: ${recentMetric?.ctl || 20}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text);
  }
}
