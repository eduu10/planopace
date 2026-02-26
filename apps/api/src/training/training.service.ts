import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'database';

const prisma = new PrismaClient();

@Injectable()
export class TrainingService {
  async generatePlan(userId: string) {
    // This will be called by the AI module via queue
    // For now, return a placeholder
    return { message: 'Geração de plano iniciada. Aguarde...' };
  }

  async getCurrentPlan(userId: string) {
    const now = new Date();
    const plan = await prisma.trainingPlan.findFirst({
      where: { userId, status: 'active' },
      include: {
        weeklyPlans: {
          include: { workouts: true },
          orderBy: { weekNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!plan) throw new NotFoundException('Nenhum plano ativo encontrado');
    return plan;
  }

  async findById(id: string) {
    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: { weeklyPlans: { include: { workouts: true } } },
    });
    if (!plan) throw new NotFoundException('Plano não encontrado');
    return plan;
  }

  async getWeeks(planId: string) {
    return prisma.weeklyPlan.findMany({
      where: { trainingPlanId: planId },
      include: { workouts: true },
      orderBy: { weekNumber: 'asc' },
    });
  }

  async getWeekWorkouts(weekId: string) {
    return prisma.workout.findMany({
      where: { weeklyPlanId: weekId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async completeWorkout(id: string) {
    return prisma.workout.update({
      where: { id },
      data: { completed: true },
    });
  }
}
