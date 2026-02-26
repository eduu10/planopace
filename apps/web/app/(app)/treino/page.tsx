"use client";

import { motion } from "framer-motion";
import { Check, Clock, Play, ChevronRight, Sparkles } from "lucide-react";

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const weeklyPlan = [
  { day: 0, title: "Longão", type: "LONG_RUN", distance: "14 km", status: "completed" },
  { day: 1, title: "Corrida Leve", type: "EASY", distance: "5.5 km", status: "completed" },
  { day: 2, title: "Descanso", type: "REST", distance: "-", status: "completed" },
  { day: 3, title: "Tiros 800m", type: "INTERVALS", distance: "7 km", status: "today" },
  { day: 4, title: "Descanso", type: "REST", distance: "-", status: "upcoming" },
  { day: 5, title: "Tempo Run", type: "TEMPO", distance: "9 km", status: "upcoming" },
  { day: 6, title: "Corrida Leve", type: "EASY", distance: "6 km", status: "upcoming" },
];

const typeColors: Record<string, string> = {
  EASY: "bg-green-500",
  INTERVALS: "bg-red-500",
  TEMPO: "bg-orange-500",
  LONG_RUN: "bg-purple-500",
  REST: "bg-gray-600",
};

export default function TreinoPage() {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plano Semanal</h1>
          <p className="text-gray-400 text-sm">Semana 2 de 4 — Construção de Volume</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl transition-colors">
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Week progress bar */}
      <div className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06]">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progresso da semana</span>
          <span>3/5 treinos</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: "60%" }} />
        </div>
      </div>

      {/* Daily plan */}
      <div className="space-y-2">
        {weeklyPlan.map((workout, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-4 border flex items-center gap-4 transition-all ${
              workout.status === "today"
                ? "bg-orange-500/10 border-orange-500/30"
                : "bg-[#141415] border-white/[0.06]"
            }`}
          >
            {/* Day label */}
            <div className="w-10 text-center flex-shrink-0">
              <p className={`text-xs font-bold ${workout.status === "today" ? "text-orange-500" : "text-gray-500"}`}>
                {days[workout.day]}
              </p>
            </div>

            {/* Type indicator */}
            <div className={`w-1.5 h-10 rounded-full ${typeColors[workout.type]} flex-shrink-0`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${workout.status === "completed" ? "text-gray-400" : "text-white"}`}>
                {workout.title}
              </p>
              <p className="text-xs text-gray-500">{workout.distance}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {workout.status === "completed" && (
                <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
              )}
              {workout.status === "today" && (
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              )}
              {workout.status === "upcoming" && (
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Generate new plan button */}
      <button className="w-full bg-[#141415] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-sm">Gerar novo plano com IA</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}
