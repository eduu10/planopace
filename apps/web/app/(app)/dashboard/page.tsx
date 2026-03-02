"use client";

import { motion } from "framer-motion";
import { Activity, Flame, Timer, TrendingUp, Brain, ChevronRight, Zap, Camera, Loader2, WifiOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useStrava } from "@/lib/useStrava";
import { useEffect } from "react";

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
  const { activities, weekStats, loading, connected, computeVDOT } = useStrava();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const firstName = user?.name?.split(" ")[0] || "Corredor";
  const vdot = computeVDOT();

  const weekKm = weekStats.totalKm;
  const weekRuns = weekStats.totalRuns;
  const avgPace = weekStats.avgPace;

  const stats = [
    { label: "Km esta semana", value: weekKm > 0 ? weekKm.toString() : "0", icon: Activity, color: "text-green-500" },
    { label: "Pace médio", value: avgPace, icon: Timer, color: "text-orange-500" },
    { label: "Corridas", value: weekRuns.toString(), icon: Flame, color: "text-red-500" },
    { label: "VDOT", value: vdot > 0 ? vdot.toString() : "—", icon: TrendingUp, color: "text-purple-500" },
  ];

  const recentRuns = activities.slice(0, 5);
  const lastRun = activities[0];

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-6 py-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">{greeting}, {firstName}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">
          {connected ? "Dados sincronizados com Strava." : "Conecte o Strava para ver seus dados reais."}
        </p>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="ml-2 text-gray-400 text-sm">Carregando dados do Strava...</span>
        </div>
      )}

      {/* Not connected banner */}
      {!loading && !connected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <WifiOff className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-300">Nenhum app conectado</p>
            <p className="text-xs text-gray-400 mt-0.5">Conecte o Strava para ver suas estatísticas reais.</p>
          </div>
          <Link
            href="/perfil"
            className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full font-bold"
          >
            Conectar
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      {!loading && (
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
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Last Run Highlight */}
      {!loading && lastRun && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Última Corrida</h2>
            <span className={`${typeColors[lastRun.type] || "bg-gray-500"} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
              {typeLabels[lastRun.type] || lastRun.type}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-4">{lastRun.dateFormatted}</p>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-gray-500">Distância</p>
              <p className="font-bold">{lastRun.distance}</p>
            </div>
            <div>
              <p className="text-gray-500">Pace médio</p>
              <p className="font-bold">{lastRun.pace}</p>
            </div>
            <div>
              <p className="text-gray-500">Tempo</p>
              <p className="font-bold">{lastRun.time}</p>
            </div>
            {lastRun.avgHr && (
              <div>
                <p className="text-gray-500">FC média</p>
                <p className="font-bold">{lastRun.avgHr} bpm</p>
              </div>
            )}
          </div>
          {lastRun.elevation && lastRun.elevation > 0 && (
            <p className="text-xs text-gray-500 mt-3">Elevação: +{Math.round(lastRun.elevation)}m</p>
          )}
        </motion.div>
      )}

      {/* AI Insight */}
      {!loading && connected && (
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
            {weekRuns > 0
              ? `Você correu ${weekKm} km em ${weekRuns} treino${weekRuns > 1 ? "s" : ""} esta semana com pace médio de ${avgPace}/km. ${
                  weekRuns >= 3
                    ? "Boa consistência! Continue mantendo a frequência."
                    : "Tente manter pelo menos 3 treinos por semana para evolução consistente."
                }${vdot > 0 ? ` Seu VDOT estimado é ${vdot}, continue assim!` : ""}`
              : "Nenhuma corrida registrada esta semana. Que tal sair para um treino leve hoje?"}
          </p>
        </motion.div>
      )}

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
      {!loading && recentRuns.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Corridas Recentes</h2>
            <Link href="/corridas" className="text-orange-500 text-sm flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentRuns.map((run, i) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="bg-[#141415] rounded-xl p-3 border border-white/[0.06] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${typeColors[run.type] || "bg-gray-500"}`} />
                  <div>
                    <p className="font-medium text-sm">{run.distance}</p>
                    <p className="text-xs text-gray-500">{run.dateFormatted}</p>
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
      )}
    </div>
  );
}
