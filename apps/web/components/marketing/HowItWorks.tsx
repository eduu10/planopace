"use client";

import { motion } from "framer-motion";
import { UserPlus, Link, Play, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-white" />,
    title: "Crie seu Perfil",
    description: "Defina seus objetivos: 5k, 10k, Meia ou Maratona. Nossa IA analisa seu histórico."
  },
  {
    icon: <Link className="w-8 h-8 text-white" />,
    title: "Conecte o Strava",
    description: "Sincronize sua conta. Puxamos seus dados automaticamente para calibrar o treino."
  },
  {
    icon: <Play className="w-8 h-8 text-white" />,
    title: "Receba o Plano",
    description: "Sua planilha mensal é gerada instantaneamente, adaptada à sua rotina."
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    title: "Evolua",
    description: "Treine, sincronize e veja a mágica. O plano se ajusta semanalmente ao seu progresso."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-zinc-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="text-orange-500 font-mono text-sm tracking-widest uppercase">Processo Simples</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-2">
            DO ZERO À <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">LINHA DE CHEGADA</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
