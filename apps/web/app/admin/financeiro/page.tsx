"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const metrics = [
  { label: "MRR", value: "R$ 28.460", change: "+12%", trend: "up", icon: DollarSign },
  { label: "ARR", value: "R$ 341.520", change: "+12%", trend: "up", icon: TrendingUp },
  { label: "Cobranças (mês)", value: "843", change: "+34", trend: "up", icon: CreditCard },
  { label: "Reembolsos", value: "R$ 318", change: "-45%", trend: "down", icon: RefreshCw },
];

const monthlyRevenue = [
  { month: "Set", mensal: 6200, semestral: 7800, anual: 4200 },
  { month: "Out", mensal: 6800, semestral: 8500, anual: 4800 },
  { month: "Nov", mensal: 7200, semestral: 9800, anual: 5800 },
  { month: "Dez", mensal: 7500, semestral: 10200, anual: 6600 },
  { month: "Jan", mensal: 7800, semestral: 10800, anual: 7500 },
  { month: "Fev", mensal: 8200, semestral: 12400, anual: 7860 },
];

const transactions = [
  { id: "TXN-001", user: "João Demo", plan: "Semestral", amount: "R$ 149,90", status: "paid", date: "26 Fev 2026" },
  { id: "TXN-002", user: "Maria Santos", plan: "Mensal", amount: "R$ 29,90", status: "paid", date: "26 Fev 2026" },
  { id: "TXN-003", user: "Ana Costa", plan: "Anual", amount: "R$ 299,90", status: "paid", date: "25 Fev 2026" },
  { id: "TXN-004", user: "Pedro Oliveira", plan: "Mensal", amount: "R$ 29,90", status: "paid", date: "25 Fev 2026" },
  { id: "TXN-005", user: "Fernanda Lima", plan: "Mensal", amount: "R$ 29,90", status: "refunded", date: "24 Fev 2026" },
  { id: "TXN-006", user: "Carlos Mendes", plan: "Anual", amount: "R$ 299,90", status: "paid", date: "24 Fev 2026" },
  { id: "TXN-007", user: "Lucas Silva", plan: "Semestral", amount: "R$ 149,90", status: "paid", date: "23 Fev 2026" },
  { id: "TXN-008", user: "Julia Souza", plan: "Mensal", amount: "R$ 29,90", status: "pending", date: "23 Fev 2026" },
];

const statusColors: Record<string, string> = {
  paid: "bg-green-500/20 text-green-400",
  refunded: "bg-red-500/20 text-red-400",
  pending: "bg-yellow-500/20 text-yellow-400",
};

const statusLabels: Record<string, string> = {
  paid: "Pago",
  refunded: "Reembolsado",
  pending: "Pendente",
};

export default function AdminFinanceiro() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Financeiro</h1>
        <p className="text-gray-400 mt-1">Receita, transações e métricas financeiras.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#141415] rounded-2xl p-4 sm:p-5 border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-500/10 p-2 rounded-xl">
                <metric.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono ${
                metric.trend === "up" ? "text-green-400" : "text-green-400"
              }`}>
                {metric.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.change}
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue by Plan Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06]"
      >
        <h2 className="text-lg font-bold mb-1">Receita por Período</h2>
        <p className="text-sm text-gray-500 mb-4">Últimos 6 meses - empilhado</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#141415", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#9CA3AF" }}
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
              />
              <Bar dataKey="mensal" stackId="a" fill="#6B7280" name="Mensal" radius={[0, 0, 0, 0]} />
              <Bar dataKey="semestral" stackId="a" fill="#F97316" name="Semestral" radius={[0, 0, 0, 0]} />
              <Bar dataKey="anual" stackId="a" fill="#A855F7" name="Anual" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 mt-3 text-xs justify-center">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-500" /> Mensal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> Semestral</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500" /> Anual</span>
        </div>
      </motion.div>

      {/* Transactions - Mobile Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:hidden space-y-3"
      >
        <h2 className="text-lg font-bold">Transações Recentes</h2>
        {transactions.map((txn) => (
          <div key={txn.id} className="bg-[#141415] rounded-2xl border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{txn.user}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[txn.status]}`}>
                {statusLabels[txn.status]}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{txn.plan}</span>
              <span className="font-mono font-bold">{txn.amount}</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="font-mono">{txn.id}</span>
              <span>{txn.date}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Transactions - Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden hidden md:block"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold">Transações Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-white/[0.06]">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Usuário</th>
                <th className="px-6 py-3 font-medium">Plano</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 font-mono text-gray-400">{txn.id}</td>
                  <td className="px-6 py-3 font-medium">{txn.user}</td>
                  <td className="px-6 py-3 text-gray-400">{txn.plan}</td>
                  <td className="px-6 py-3 font-mono">{txn.amount}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[txn.status]}`}>
                      {statusLabels[txn.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-right">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
