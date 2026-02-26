"use client";

import { motion } from "framer-motion";
import { Activity, Zap, BarChart3, Smartphone } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-8 h-8 text-orange-500" />,
    title: "IA Generativa de Treinos",
    description: "Nossa IA analisa seu histórico e cria planilhas mensais personalizadas para o seu objetivo, seja 5k ou Maratona."
  },
  {
    icon: <Smartphone className="w-8 h-8 text-orange-500" />,
    title: "Integração Strava & Adidas",
    description: "Conecte seus apps favoritos. Nós puxamos os dados automaticamente para ajustar seu treino em tempo real."
  },
  {
    icon: <Activity className="w-8 h-8 text-orange-500" />,
    title: "Ajustes Dinâmicos",
    description: "Correu mais lento que o planejado? A IA recalcula a carga da semana seguinte para evitar lesões e manter a evolução."
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
    title: "Perfil Evolutivo",
    description: "Dashboard completo com métricas avançadas. Acompanhe seu VO2, pace médio e projeção de tempo para provas."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Mais que um app, um <span className="text-orange-500">Treinador Autônomo</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A tecnologia que faltava para você sair da estagnação e bater seus recordes pessoais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/50 border border-white/5 p-8 rounded-2xl hover:bg-zinc-900 hover:border-orange-500/30 transition-all group"
            >
              <div className="bg-zinc-800 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
