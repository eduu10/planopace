"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Camera } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useVictories } from "@/stores/victories";
import Link from "next/link";

const stats = [
  { label: "Total Usuários", value: "1.247", change: "+89", trend: "up", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Assinantes Ativos", value: "843", change: "+34", trend: "up", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "MRR", value: "R$ 28.460", change: "+12%", trend: "up", icon: CreditCard, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Churn Rate", value: "3.2%", change: "-0.4%", trend: "down", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const revenueData = [
  { month: "Set", value: 18200 },
  { month: "Out", value: 20100 },
  { month: "Nov", value: 22800 },
  { month: "Dez", value: 24300 },
  { month: "Jan", value: 26100 },
  { month: "Fev", value: 28460 },
];

const signupsData = [
  { day: "Seg", users: 12 },
  { day: "Ter", users: 18 },
  { day: "Qua", users: 15 },
  { day: "Qui", users: 22 },
  { day: "Sex", users: 28 },
  { day: "Sáb", users: 8 },
  { day: "Dom", users: 5 },
];

const planDistribution = [
  { name: "Mensal", count: 412, color: "bg-gray-500", pct: 49 },
  { name: "Semestral", count: 298, color: "bg-orange-500", pct: 35 },
  { name: "Anual", count: 133, color: "bg-purple-500", pct: 16 },
];

const recentUsers = [
  { name: "Maria Santos", email: "maria@email.com", plan: "Semestral", date: "Hoje" },
  { name: "Pedro Oliveira", email: "pedro@email.com", plan: "Mensal", date: "Hoje" },
  { name: "Ana Costa", email: "ana@email.com", plan: "Anual", date: "Ontem" },
  { name: "Lucas Silva", email: "lucas@email.com", plan: "Semestral", date: "Ontem" },
  { name: "Julia Souza", email: "julia@email.com", plan: "Mensal", date: "25 Fev" },
];

const planColors: Record<string, string> = {
  Mensal: "bg-gray-500/20 text-gray-400",
  Semestral: "bg-orange-500/20 text-orange-400",
  Anual: "bg-purple-500/20 text-purple-400",
};

export default function AdminDashboard() {
  const { victories, hydrate } = useVictories();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral da plataforma Plano Pace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#141415] rounded-2xl p-4 sm:p-5 border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} p-2 rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono ${
                stat.trend === "up" ? "text-green-400" : "text-green-400"
              }`}>
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Victory Photos Counter */}
      <Link href="/admin/vitorias">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-2xl p-5 border border-orange-500/30 hover:border-orange-500/50 transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{victories.length}</p>
                <p className="text-sm text-gray-400">Fotos com filtro PlanoPace</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-orange-500" />
          </div>
        </motion.div>
      </Link>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06]"
        >
          <h2 className="text-lg font-bold mb-1">Receita Mensal (MRR)</h2>
          <p className="text-sm text-gray-500 mb-4">Últimos 6 meses</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141415", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#9CA3AF" }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"]}
                />
                <Area type="monotone" dataKey="value" stroke="#F97316" fill="#F97316" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Signups Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06]"
        >
          <h2 className="text-lg font-bold mb-1">Novos Cadastros</h2>
          <p className="text-sm text-gray-500 mb-4">Esta semana</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupsData}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141415", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#9CA3AF" }}
                />
                <Bar dataKey="users" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Cadastros" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06]"
        >
          <h2 className="text-lg font-bold mb-4">Distribuição de Planos</h2>
          <div className="space-y-4">
            {planDistribution.map((plan) => (
              <div key={plan.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{plan.name}</span>
                  <span className="text-sm text-gray-400">{plan.count} ({plan.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${plan.color} rounded-full`} style={{ width: `${plan.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total assinantes</span>
              <span className="font-bold">843</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#141415] rounded-2xl p-4 sm:p-6 border border-white/[0.06] lg:col-span-2"
        >
          <h2 className="text-lg font-bold mb-4">Últimos Cadastros</h2>

          {/* Mobile list */}
          <div className="space-y-3 sm:hidden">
            {recentUsers.map((user, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${planColors[user.plan]}`}>
                    {user.plan}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{user.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="pb-3 font-medium">Nome</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Plano</th>
                  <th className="pb-3 font-medium text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {recentUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-medium">{user.name}</td>
                    <td className="py-3 text-gray-400">{user.email}</td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${planColors[user.plan]}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-right">{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
