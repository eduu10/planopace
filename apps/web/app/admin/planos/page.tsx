"use client";

import { motion } from "framer-motion";
import { Check, Users, TrendingUp, Shirt } from "lucide-react";

const plans = [
  {
    name: "Mensal",
    price: "R$ 29,90",
    subscribers: 412,
    mrr: "R$ 12.318,80",
    growth: "+5%",
    color: "border-gray-500",
    badge: "bg-gray-500/20 text-gray-400",
  },
  {
    name: "Semestral",
    price: "R$ 149,90",
    priceNote: "R$ 149,90 / 6 meses",
    subscribers: 298,
    mrr: "R$ 7.445,00",
    growth: "+12%",
    color: "border-orange-500",
    badge: "bg-orange-500/20 text-orange-400",
  },
  {
    name: "Anual",
    price: "R$ 299,90",
    priceNote: "R$ 299,90 / ano",
    subscribers: 133,
    mrr: "R$ 3.324,00",
    growth: "+18%",
    color: "border-purple-500",
    badge: "bg-purple-500/20 text-purple-400",
    bonus: true,
  },
];

const features = [
  "Planilha personalizada por IA",
  "Sync automático com Strava",
  "Dashboard completo de métricas",
  "Ajustes semanais automáticos",
  "Métricas avançadas (TSS/CTL/ATL)",
  "Preparação para provas",
  "Análise de zonas de FC",
  "Detecção de overtraining",
  "Previsão de pace para provas",
  "Suporte prioritário via chat",
];

const conversionFunnel = [
  { stage: "Visitantes", count: "12.480", pct: 100 },
  { stage: "Cadastros", count: "1.247", pct: 10 },
  { stage: "Trial ativo", count: "986", pct: 7.9 },
  { stage: "Assinante pago", count: "843", pct: 6.8 },
];

export default function AdminPlanos() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Planos</h1>
        <p className="text-gray-400 mt-1">Plano único com 3 períodos de cobrança.</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-[#141415] rounded-2xl p-5 sm:p-6 border-2 ${plan.color}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plan.badge}`}>
                {plan.name}
              </span>
              <span className="text-green-400 text-xs font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {plan.growth}
              </span>
            </div>

            <p className="text-3xl font-black mb-1">{plan.price}</p>
            <p className="text-xs text-gray-500 mb-4">{plan.priceNote || "/mês"}</p>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{plan.subscribers} assinantes</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl mb-4">
              <p className="text-xs text-gray-500">MRR</p>
              <p className="text-lg font-bold">{plan.mrr}</p>
            </div>

            {plan.bonus && (
              <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Shirt className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-orange-400 font-bold">+ Camisa de corrida</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Features - All plans include */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06]"
      >
        <h2 className="text-lg font-bold mb-1">Funcionalidades incluídas</h2>
        <p className="text-sm text-gray-500 mb-4">Todos os períodos incluem acesso completo</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-2 text-xs text-gray-400">
              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
              {f}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#141415] rounded-2xl p-6 border border-white/[0.06]"
      >
        <h2 className="text-lg font-bold mb-1">Funil de Conversão</h2>
        <p className="text-sm text-gray-500 mb-6">Últimos 30 dias</p>

        <div className="space-y-4">
          {conversionFunnel.map((step) => (
            <div key={step.stage}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{step.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono">{step.count}</span>
                  <span className="text-xs text-gray-500 w-12 text-right">{step.pct}%</span>
                </div>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${step.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]">
          <p className="text-xs text-gray-500 mb-1">ARPU</p>
          <p className="text-2xl font-bold">R$ 17,40</p>
          <p className="text-xs text-green-400 mt-1">+R$ 0,80 vs mês anterior</p>
        </div>
        <div className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]">
          <p className="text-xs text-gray-500 mb-1">LTV médio</p>
          <p className="text-2xl font-bold">R$ 208,80</p>
          <p className="text-xs text-green-400 mt-1">12 meses de retenção média</p>
        </div>
        <div className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]">
          <p className="text-xs text-gray-500 mb-1">Trial → Pago</p>
          <p className="text-2xl font-bold">68%</p>
          <p className="text-xs text-green-400 mt-1">+3% vs mês anterior</p>
        </div>
      </div>
    </div>
  );
}
