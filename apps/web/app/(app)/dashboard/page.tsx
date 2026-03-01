"use client";

import { motion } from "framer-motion";
import { Activity, Flame, Timer, TrendingUp, Brain, ChevronRight, Zap, Camera } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const stats = [
  { label: "Km esta semana", value: "23.4", icon: Activity, color: "text-green-500", trend: "+12%" },
  { label: "Pace médio", value: "5:42", icon: Timer, color: "text-orange-500", trend: "-0:08" },
  { label: "Corridas", value: "4", icon: Flame, color: "text-red-500", trend: "+1" },
  { label: "VDOT", value: "38.2", icon: TrendingUp, color: "text-purple-500", trend: "+0.5" },
];

const todayWorkout = {
  type: "INTERVALS",
  title: "Tiros 800m",
  description: "Aquecimento 10min + 6x800m (pace 4:50-5:10) com 120s recuperação + desaquecimento 10min",
  distance: "7.0 km",
  pace: "4:50 - 5:10 /km",
  duration: "~45 min",
};

const typeColors: Record<string, string> = {
  EASY: "bg-green-500",
  INTERVALS: "bg-red-500",
  TEMPO: "bg-orange-500",
  LONG_RUN: "bg-purple-500",
  REST: "bg-gray-500",
};

const typeLabels: Record<string, string> = {
  EASY: "Corrida Leve",
  INTERVALS: "Intervalado",
  TEMPO: "Tempo Run",
  LONG_RUN: "Longão",
  REST: "Descanso",
};

export default function DashboardPage() {
  const { user, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const firstName = user?.name?.split(" ")[0] || "Corredor";

  return (
    <div className="space-y-6 py-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Bom dia, {firstName}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Seu treino de hoje está pronto.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-green-400 font-mono">{stat.trend}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's Workout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Treino de Hoje</h2>
          <span className={`${typeColors[todayWorkout.type]} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
            {typeLabels[todayWorkout.type]}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">{todayWorkout.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{todayWorkout.description}</p>
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-gray-500">Distância</p>
            <p className="font-bold">{todayWorkout.distance}</p>
          </div>
          <div>
            <p className="text-gray-500">Pace alvo</p>
            <p className="font-bold">{todayWorkout.pace}</p>
          </div>
          <div>
            <p className="text-gray-500">Duração</p>
            <p className="font-bold">{todayWorkout.duration}</p>
          </div>
        </div>
        <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Iniciar Treino
        </button>
      </motion.div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 rounded-2xl p-5 border border-purple-500/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold text-purple-300">Insight da IA</h2>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          Sua forma está em ascensão! O TSB de +5.2 indica boa recuperação.
          O treino intervalado de hoje vai potencializar seu VO2max.
          Mantenha a hidratação e durma bem esta noite.
        </p>
      </motion.div>

      {/* Registrar Vitória */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Link href="/vitorias" className="block">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-2xl p-5 border border-orange-500/30 hover:border-orange-500/50 transition-all active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2.5 rounded-xl">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold">Registrar Vitória</h2>
                  <p className="text-sm text-gray-400">Tire uma foto e compartilhe!</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Runs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Corridas Recentes</h2>
          <Link href="/corridas" className="text-orange-500 text-sm flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {[
            { date: "Hoje", dist: "5.2 km", pace: "5:38/km", time: "29:18", type: "EASY" },
            { date: "Ontem", dist: "8.1 km", pace: "5:22/km", time: "43:29", type: "TEMPO" },
            { date: "25 Fev", dist: "12.5 km", pace: "6:05/km", time: "1:16:03", type: "LONG_RUN" },
          ].map((run, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="bg-[#141415] rounded-xl p-3 border border-white/[0.06] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${typeColors[run.type]}`} />
                <div>
                  <p className="font-medium text-sm">{run.dist}</p>
                  <p className="text-xs text-gray-500">{run.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">{run.pace}</p>
                <p className="text-xs text-gray-500">{run.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
