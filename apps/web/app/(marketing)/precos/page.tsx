"use client";

import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "19,90",
    features: ["Planilha mensal IA", "Sync Strava", "Dashboard básico", "Suporte por email"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "34,90",
    features: ["Tudo do Starter", "Ajustes semanais automáticos", "Métricas avançadas (TSS/CTL/ATL)", "Preparação para provas", "Análise de zonas de FC"],
    highlight: true,
  },
  {
    name: "Elite",
    price: "49,90",
    features: ["Tudo do Pro", "Detecção de overtraining", "Previsão de pace para provas", "Periodização inteligente", "Suporte prioritário via chat"],
    highlight: false,
  },
];

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Invista na sua <span className="text-orange-500">Evolução</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Muito mais barato que uma assessoria tradicional, muito mais inteligente que uma planilha estática.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 border ${
                plan.highlight
                  ? "bg-zinc-900 border-orange-500 scale-105"
                  : "bg-zinc-950 border-white/10"
              }`}
            >
              {plan.highlight && (
                <div className="text-center mb-4">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Mais Popular</span>
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-sm text-gray-400">R$</span>
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-gray-400 ml-1">/mês</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-orange-500" : "text-gray-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-bold transition-all ${
                plan.highlight
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-white text-black hover:bg-gray-200"
              }`}>
                Escolher {plan.name}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
