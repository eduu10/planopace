"use client";

import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";

const runs = [
  { id: "1", date: "26 Fev 2026", dist: 5.2, pace: "5:38", time: "29:18", type: "EASY", hr: 142 },
  { id: "2", date: "25 Fev 2026", dist: 8.1, pace: "5:22", time: "43:29", type: "TEMPO", hr: 158 },
  { id: "3", date: "23 Fev 2026", dist: 12.5, pace: "6:05", time: "1:16:03", type: "LONG_RUN", hr: 145 },
  { id: "4", date: "22 Fev 2026", dist: 5.8, pace: "5:52", time: "33:58", type: "EASY", hr: 138 },
  { id: "5", date: "20 Fev 2026", dist: 7.2, pace: "5:05", time: "36:36", type: "INTERVALS", hr: 165 },
  { id: "6", date: "19 Fev 2026", dist: 6.0, pace: "5:45", time: "34:30", type: "EASY", hr: 140 },
  { id: "7", date: "17 Fev 2026", dist: 14.0, pace: "6:12", time: "1:26:48", type: "LONG_RUN", hr: 148 },
  { id: "8", date: "15 Fev 2026", dist: 9.5, pace: "5:18", time: "50:21", type: "TEMPO", hr: 160 },
];

const typeColors: Record<string, string> = {
  EASY: "bg-green-500",
  INTERVALS: "bg-red-500",
  TEMPO: "bg-orange-500",
  LONG_RUN: "bg-purple-500",
  REST: "bg-gray-600",
};

const typeLabels: Record<string, string> = {
  EASY: "Leve",
  INTERVALS: "Intervalado",
  TEMPO: "Tempo",
  LONG_RUN: "Longão",
};

export default function CorridasPage() {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Corridas</h1>
        <div className="flex gap-2">
          <button className="bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5 text-gray-400" />
          </button>
          <button className="bg-orange-500 p-2 rounded-xl hover:bg-orange-600 transition-colors">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#141415] rounded-xl p-3 border border-white/[0.06] text-center">
          <p className="text-lg font-bold">68.3</p>
          <p className="text-[10px] text-gray-500">Total km</p>
        </div>
        <div className="bg-[#141415] rounded-xl p-3 border border-white/[0.06] text-center">
          <p className="text-lg font-bold">5:37</p>
          <p className="text-[10px] text-gray-500">Pace médio</p>
        </div>
        <div className="bg-[#141415] rounded-xl p-3 border border-white/[0.06] text-center">
          <p className="text-lg font-bold">8</p>
          <p className="text-[10px] text-gray-500">Corridas</p>
        </div>
      </div>

      {/* Runs list */}
      <div className="space-y-2">
        {runs.map((run, i) => (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-[#141415] rounded-xl p-4 border border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${typeColors[run.type]}`} />
                <span className="text-xs text-gray-500">{run.date}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeColors[run.type]} text-white`}>
                  {typeLabels[run.type]}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div>
                  <p className="text-lg font-bold">{run.dist} km</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-mono">{run.pace}/km</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p className="font-mono">{run.time}</p>
                <p className="text-xs">{run.hr} bpm</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
