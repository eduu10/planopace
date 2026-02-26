"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const paceData = [
  { date: "01/02", pace: 6.1 },
  { date: "05/02", pace: 5.9 },
  { date: "08/02", pace: 5.85 },
  { date: "12/02", pace: 5.7 },
  { date: "15/02", pace: 5.8 },
  { date: "18/02", pace: 5.65 },
  { date: "22/02", pace: 5.5 },
  { date: "25/02", pace: 5.42 },
];

const volumeData = [
  { week: "Sem 1", km: 18 },
  { week: "Sem 2", km: 22 },
  { week: "Sem 3", km: 20 },
  { week: "Sem 4", km: 25 },
  { week: "Sem 5", km: 23 },
  { week: "Sem 6", km: 28 },
  { week: "Sem 7", km: 26 },
  { week: "Sem 8", km: 30 },
];

const fitnessData = [
  { date: "01/02", ctl: 22, atl: 18, tsb: 4 },
  { date: "05/02", ctl: 24, atl: 22, tsb: 2 },
  { date: "08/02", ctl: 26, atl: 20, tsb: 6 },
  { date: "12/02", ctl: 28, atl: 25, tsb: 3 },
  { date: "15/02", ctl: 30, atl: 28, tsb: 2 },
  { date: "18/02", ctl: 32, atl: 26, tsb: 6 },
  { date: "22/02", ctl: 34, atl: 30, tsb: 4 },
  { date: "25/02", ctl: 35, atl: 30, tsb: 5 },
];

const metrics = [
  { label: "CTL (Fitness)", value: "35.2", trend: "up", change: "+3.1" },
  { label: "ATL (Fadiga)", value: "29.8", trend: "down", change: "-1.2" },
  { label: "TSB (Forma)", value: "+5.4", trend: "up", change: "+1.8" },
  { label: "VDOT", value: "38.2", trend: "neutral", change: "+0.3" },
];

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors = { up: "text-green-500", down: "text-red-500", neutral: "text-gray-500" };

export default function EvolucaoPage() {
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
              className="bg-[#141415] rounded-2xl p-4 border border-white/[0.06]"
            >
              <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{metric.value}</p>
                <div className={`flex items-center gap-0.5 ${trendColors[metric.trend as keyof typeof trendColors]}`}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="text-xs font-mono">{metric.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pace Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]"
      >
        <h2 className="text-sm font-bold mb-4">Evolução do Pace</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={paceData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} reversed />
              <Tooltip
                contentStyle={{ backgroundColor: "#141415", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#9CA3AF" }}
                itemStyle={{ color: "#F97316" }}
              />
              <Line type="monotone" dataKey="pace" stroke="#F97316" strokeWidth={2} dot={{ fill: "#F97316", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Volume Chart */}
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
              />
              <Area type="monotone" dataKey="km" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Fitness Chart (CTL/ATL/TSB) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]"
      >
        <h2 className="text-sm font-bold mb-4">Fitness / Fadiga / Forma</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fitnessData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
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
    </div>
  );
}
