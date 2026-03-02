"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Loader2, WifiOff, HelpCircle, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useStrava } from "@/lib/useStrava";
import Link from "next/link";
import { useState } from "react";

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors = { up: "text-green-500", down: "text-red-500", neutral: "text-gray-500" };

const metricHelp: Record<string, string> = {
  "CTL (Fitness)": "Chronic Training Load — Representa sua forma física acumulada nos últimos 42 dias. Quanto maior, mais preparado você está. Sobe com treinos consistentes ao longo do tempo.",
  "ATL (Fadiga)": "Acute Training Load — Mede a carga de treino recente (últimos 7 dias). Um valor alto indica que você treinou forte recentemente e pode precisar de descanso.",
  "TSB (Forma)": "Training Stress Balance — É a diferença entre CTL e ATL (Fitness - Fadiga). Valores positivos indicam que você está descansado e pronto para competir. Valores negativos indicam fadiga acumulada.",
  "VDOT": "Índice de capacidade aeróbica estimado pela fórmula de Jack Daniels, calculado a partir das suas corridas recentes (3km a 21km). Quanto maior o VDOT, melhor sua performance.",
};

const chartHelp: Record<string, string> = {
  "pace": "Mostra a evolução do seu pace médio (min/km) ao longo das corridas. Uma linha descendente indica melhora — você está ficando mais rápido!",
  "fitness": "CTL (azul) = Fitness acumulado. ATL (vermelho) = Fadiga recente. TSB (verde) = Forma atual. Quando TSB está positivo, você está descansado; quando negativo, está acumulando fadiga.",
};

function InfoTooltip({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1E1E20] border border-white/10 rounded-xl p-3 shadow-xl"
      >
        <div className="flex items-start gap-2">
          <p className="text-xs text-gray-300 leading-relaxed flex-1">{text}</p>
          <button onClick={onClose} className="text-gray-500 hover:text-white flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function EvolucaoPage() {
  const { loading, connected, computeVDOT, getPaceData, getVolumeData, getFitnessData } = useStrava();
  const [openHelp, setOpenHelp] = useState<string | null>(null);

  const vdot = computeVDOT();
  const paceData = getPaceData();
  const volumeData = getVolumeData();
  const fitnessData = getFitnessData();

  const lastFitness = fitnessData.length > 0 ? fitnessData[fitnessData.length - 1] : null;
  const prevFitness = fitnessData.length > 1 ? fitnessData[fitnessData.length - 2] : null;

  const metrics = [
    {
      label: "CTL (Fitness)",
      value: lastFitness ? lastFitness.ctl.toString() : "—",
      trend: lastFitness && prevFitness ? (lastFitness.ctl > prevFitness.ctl ? "up" : lastFitness.ctl < prevFitness.ctl ? "down" : "neutral") : "neutral",
      change: lastFitness && prevFitness ? `${lastFitness.ctl - prevFitness.ctl >= 0 ? "+" : ""}${(lastFitness.ctl - prevFitness.ctl).toFixed(1)}` : "—",
    },
    {
      label: "ATL (Fadiga)",
      value: lastFitness ? lastFitness.atl.toString() : "—",
      trend: lastFitness && prevFitness ? (lastFitness.atl < prevFitness.atl ? "up" : lastFitness.atl > prevFitness.atl ? "down" : "neutral") : "neutral",
      change: lastFitness && prevFitness ? `${lastFitness.atl - prevFitness.atl >= 0 ? "+" : ""}${(lastFitness.atl - prevFitness.atl).toFixed(1)}` : "—",
    },
    {
      label: "TSB (Forma)",
      value: lastFitness ? `${lastFitness.tsb >= 0 ? "+" : ""}${lastFitness.tsb}` : "—",
      trend: lastFitness && prevFitness ? (lastFitness.tsb > prevFitness.tsb ? "up" : lastFitness.tsb < prevFitness.tsb ? "down" : "neutral") : "neutral",
      change: lastFitness && prevFitness ? `${lastFitness.tsb - prevFitness.tsb >= 0 ? "+" : ""}${(lastFitness.tsb - prevFitness.tsb).toFixed(1)}` : "—",
    },
    {
      label: "VDOT",
      value: vdot > 0 ? vdot.toString() : "—",
      trend: "neutral" as const,
      change: "—",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <span className="ml-2 text-gray-400 text-sm">Carregando evolução...</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-6 py-4">
        <h1 className="text-2xl font-bold">Evolução</h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 text-center"
        >
          <WifiOff className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Strava não conectado</h2>
          <p className="text-sm text-gray-400 mb-4">
            Conecte o Strava para ver gráficos de evolução com seus dados reais de corrida.
          </p>
          <Link
            href="/perfil"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            Conectar Strava
          </Link>
        </motion.div>
      </div>
    );
  }

  const toggleHelp = (key: string) => {
    setOpenHelp(openHelp === key ? null : key);
  };

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-bold">Evolução</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => {
          const TrendIcon = trendIcons[metric.trend as keyof typeof trendIcons];
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06] relative"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">{metric.label}</p>
                <button
                  onClick={() => toggleHelp(metric.label)}
                  className="text-gray-600 hover:text-orange-400 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{metric.value}</p>
                {metric.change !== "—" && (
                  <div className={`flex items-center gap-0.5 ${trendColors[metric.trend as keyof typeof trendColors]}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span className="text-xs font-mono">{metric.change}</span>
                  </div>
                )}
              </div>
              {openHelp === metric.label && metricHelp[metric.label] && (
                <InfoTooltip
                  text={metricHelp[metric.label]}
                  onClose={() => setOpenHelp(null)}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pace Evolution Chart */}
      {paceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06] relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Evolução do Pace</h2>
            <button
              onClick={() => toggleHelp("pace")}
              className="text-gray-600 hover:text-orange-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          {openHelp === "pace" && (
            <InfoTooltip
              text={chartHelp["pace"]}
              onClose={() => setOpenHelp(null)}
            />
          )}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paceData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} reversed />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141415", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#9CA3AF" }}
                  itemStyle={{ color: "#F97316" }}
                  formatter={(value: number) => {
                    const mins = Math.floor(value);
                    const secs = Math.round((value - mins) * 60);
                    return [`${mins}:${secs.toString().padStart(2, "0")} /km`, "Pace"];
                  }}
                />
                <Line type="monotone" dataKey="pace" stroke="#F97316" strokeWidth={2} dot={{ fill: "#F97316", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Volume Chart */}
      {volumeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]"
        >
          <h2 className="text-sm font-bold mb-4">Volume Semanal (km)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141415", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#9CA3AF" }}
                  formatter={(value: number) => [`${value} km`, "Volume"]}
                />
                <Area type="monotone" dataKey="km" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Fitness Chart (CTL/ATL/TSB) */}
      {fitnessData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06] relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Fitness / Fadiga / Forma</h2>
            <button
              onClick={() => toggleHelp("fitness")}
              className="text-gray-600 hover:text-orange-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          {openHelp === "fitness" && (
            <InfoTooltip
              text={chartHelp["fitness"]}
              onClose={() => setOpenHelp(null)}
            />
          )}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fitnessData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141415", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#9CA3AF" }}
                />
                <Line type="monotone" dataKey="ctl" stroke="#3B82F6" strokeWidth={2} name="CTL (Fitness)" dot={false} />
                <Line type="monotone" dataKey="atl" stroke="#EF4444" strokeWidth={2} name="ATL (Fadiga)" dot={false} />
                <Line type="monotone" dataKey="tsb" stroke="#22C55E" strokeWidth={2} name="TSB (Forma)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> CTL</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> ATL</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> TSB</span>
          </div>
        </motion.div>
      )}

      {/* No data state */}
      {paceData.length === 0 && volumeData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06] text-center"
        >
          <p className="text-gray-400 text-sm">
            Nenhuma atividade de corrida encontrada no Strava. Comece a correr e seus dados aparecerão aqui!
          </p>
        </motion.div>
      )}
    </div>
  );
}
