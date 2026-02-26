import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@planopace.com' },
    update: {},
    create: {
      email: 'demo@planopace.com',
      name: 'João Demo',
      passwordHash,
      plan: 'PRO',
    },
  });

  // Create athlete profile
  await prisma.athleteProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      age: 32,
      weight: 75,
      height: 178,
      experienceYears: 2.5,
      currentPace: 5.8,
      goalType: 'RACE_10K',
      goalValue: 'sub-50min 10k',
      weeklyDays: 4,
      vdot: 38,
      maxHr: 185,
      restHr: 55,
    },
  });

  // Create 20 sample runs over the past 30 days
  const runTypes = ['EASY', 'EASY', 'EASY', 'INTERVALS', 'TEMPO', 'LONG_RUN', 'EASY', 'EASY'] as const;
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const type = runTypes[i % runTypes.length];
    let distanceKm: number;
    let paceAvg: number;

    switch (type) {
      case 'LONG_RUN':
        distanceKm = 12 + Math.random() * 6;
        paceAvg = 6.0 + Math.random() * 0.5;
        break;
      case 'INTERVALS':
        distanceKm = 6 + Math.random() * 2;
        paceAvg = 5.0 + Math.random() * 0.4;
        break;
      case 'TEMPO':
        distanceKm = 8 + Math.random() * 3;
        paceAvg = 5.2 + Math.random() * 0.4;
        break;
      default:
        distanceKm = 5 + Math.random() * 3;
        paceAvg = 5.8 + Math.random() * 0.6;
        break;
    }

    distanceKm = Math.round(distanceKm * 100) / 100;
    paceAvg = Math.round(paceAvg * 100) / 100;
    const durationSeconds = Math.round(distanceKm * paceAvg * 60);
    const heartRateAvg = 140 + Math.floor(Math.random() * 30);

    await prisma.run.create({
      data: {
        userId: user.id,
        date,
        distanceKm,
        durationSeconds,
        paceAvg,
        paceMax: Math.round((paceAvg - 0.5 - Math.random() * 0.5) * 100) / 100,
        heartRateAvg,
        heartRateMax: heartRateAvg + 15 + Math.floor(Math.random() * 10),
        cadenceAvg: 170 + Math.floor(Math.random() * 10),
        elevationGain: Math.round(Math.random() * 100),
        calories: Math.round(distanceKm * 65),
        type,
        source: 'manual',
      },
    });
  }

  // Create a training plan with weekly plans and workouts
  const trainingPlan = await prisma.trainingPlan.create({
    data: {
      userId: user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      goalType: 'RACE_10K',
      goalValue: 'sub-50min',
      totalWeeks: 4,
      generatedBy: 'claude',
      status: 'active',
    },
  });

  const weekThemes = ['Base & Adaptação', 'Construção de Volume', 'Intensidade', 'Recovery & Teste'];

  for (let w = 0; w < 4; w++) {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + w * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const weeklyPlan = await prisma.weeklyPlan.create({
      data: {
        userId: user.id,
        trainingPlanId: trainingPlan.id,
        weekNumber: w + 1,
        startDate,
        endDate,
        status: w === 0 ? 'active' : 'upcoming',
      },
    });

    // Create 4 workouts per week
    const workouts = [
      { day: 1, type: 'EASY' as const, title: 'Corrida Leve', desc: 'Corrida em ritmo confortável. Foco na respiração e cadência.', dist: 5 + w * 0.5, paceMin: 6.0, paceMax: 6.3, duration: 35 },
      { day: 3, type: 'INTERVALS' as const, title: `Tiros ${w < 2 ? '400m' : '800m'}`, desc: `Aquecimento 10min + ${6 - w}x${w < 2 ? 400 : 800}m com ${w < 2 ? 90 : 120}s recuperação + desaquecimento 10min`, dist: 7, paceMin: 4.8, paceMax: 5.2, duration: 45 },
      { day: 5, type: 'TEMPO' as const, title: 'Tempo Run', desc: 'Corrida em ritmo de limiar. Mantenha o esforço controlado e constante.', dist: 8 + w, paceMin: 5.3, paceMax: 5.6, duration: 45 + w * 5 },
      { day: 0, type: 'LONG_RUN' as const, title: 'Longão', desc: 'Corrida longa em ritmo confortável. Hidrate a cada 30min.', dist: 12 + w * 2, paceMin: 6.2, paceMax: 6.5, duration: 75 + w * 10 },
    ];

    for (const workout of workouts) {
      await prisma.workout.create({
        data: {
          weeklyPlanId: weeklyPlan.id,
          dayOfWeek: workout.day,
          type: workout.type,
          title: workout.title,
          description: workout.desc,
          targetDistanceKm: workout.dist,
          targetPaceMin: workout.paceMin,
          targetPaceMax: workout.paceMax,
          targetDurationMin: workout.duration,
          warmupMin: 10,
          cooldownMin: 10,
          completed: w === 0 && workout.day < 5,
        },
      });
    }
  }

  // Create metric snapshots for the last 30 days
  for (let d = 30; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);

    await prisma.metricSnapshot.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        date,
        ctl: 20 + (30 - d) * 0.3 + Math.random() * 2,
        atl: 15 + Math.random() * 10,
        tsb: 5 + Math.random() * 10 - 5,
        weeklyKm: 20 + Math.random() * 10,
        avgPace: 5.6 + Math.random() * 0.4,
        vdot: 37 + Math.random() * 2,
        runCount: 3 + Math.floor(Math.random() * 2),
      },
    });
  }

  console.log('Seed completed!');
  console.log('Demo user: demo@planopace.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
