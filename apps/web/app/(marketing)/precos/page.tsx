"use client";

import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

const features = [
  "Planilha personalizada automática",
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

const plans = [
  {
    name: "Mensal",
    price: "29,90",
    period: "/mês",
    subtitle: "Cobrança mensal",
    highlight: false,
    bonus: false,
  },
  {
    name: "Semestral",
    price: "149,90",
    period: "/6 meses",
    subtitle: "Ganhe 1 mês grátis",
    highlight: true,
    bonus: false,
  },
  {
    name: "Anual",
    price: "299,90",
    period: "/ano",
    subtitle: "Ganhe 2 meses grátis",
    highlight: false,
    bonus: true,
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
            Um plano. <span className="text-orange-500">Tudo incluso.</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Acesso completo a todas as funcionalidades. Escolha apenas o período que combina com você.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                  Mais Popular
                </div>
              )}

              {plan.bonus && (
                <>
                  <img
                    src="/camisamasculina.png"
                    alt="Camisa masculina Plano Pace"
                    className="absolute -top-10 -right-4 w-28 h-auto opacity-100 rotate-12 z-20 transition-all duration-500 group-hover:scale-125 group-hover:-top-14 group-hover:-right-6 drop-shadow-[0_4px_20px_rgba(249,115,22,0.4)]"
                  />
                  <img
                    src="/camisaf.png"
                    alt="Camisa feminina Plano Pace"
                    className="absolute -bottom-10 -left-4 w-28 h-auto opacity-100 -rotate-12 z-20 transition-all duration-500 group-hover:scale-125 group-hover:-bottom-14 group-hover:-left-6 drop-shadow-[0_4px_20px_rgba(249,115,22,0.4)]"
                  />
                </>
              )}

              <div className={`relative flex flex-col p-8 rounded-3xl border h-full transition-all duration-300 ${
                plan.highlight
                  ? "bg-zinc-900 border-orange-500 shadow-2xl shadow-orange-900/20 md:scale-105 z-10"
                  : "bg-zinc-950 border-white/10 hover:border-white/20"
              }`}>

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.subtitle}</p>

              <div className="flex items-baseline mb-8">
                <span className="text-sm text-gray-400 mr-1">R$</span>
                <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-orange-500" : "text-gray-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/registro"
                className={`block w-full py-4 rounded-xl font-bold transition-all text-center cursor-pointer ${
                  plan.highlight
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                Começar Agora
              </Link>

              <p className="text-center text-xs text-gray-500 mt-3">
                Cancele quando quiser.
              </p>

              {plan.bonus && (
                <p className="text-center text-xs text-orange-400 font-bold mt-2">
                  + Camisa de corrida grátis
                </p>
              )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
