import { motion } from "motion/react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Básico",
    price: "29,90",
    description: "Para quem quer começar com estrutura.",
    features: [
      "Planilha mensal gerada por IA",
      "Sincronização com Strava",
      "Dashboard de evolução básico",
      "Suporte por email"
    ],
    highlight: false
  },
  {
    name: "Pro",
    price: "49,90",
    description: "Para quem busca performance constante.",
    features: [
      "Tudo do plano Básico",
      "Ajustes automáticos semanais",
      "Relatório de evolução detalhado",
      "Definição de metas e provas",
      "Análise de zonas de frequência"
    ],
    highlight: true
  },
  {
    name: "Premium",
    price: "79,90",
    description: "A experiência completa de elite.",
    features: [
      "Tudo do plano Pro",
      "Insights avançados de IA",
      "Análise de overtraining",
      "Previsão de pace para provas",
      "Suporte prioritário via chat"
    ],
    highlight: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-black relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Invista na sua <span className="text-orange-500">Evolução</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Muito mais barato que uma assessoria tradicional, muito mais inteligente que uma planilha estática.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl border h-full ${
                plan.highlight 
                  ? "bg-zinc-900 border-orange-500 shadow-2xl shadow-orange-900/20 scale-105 z-10" 
                  : "bg-zinc-950 border-white/10 hover:border-white/20"
              } transition-all duration-300`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg">
                  Mais Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>
              
              <div className="flex items-baseline mb-8">
                <span className="text-sm text-gray-400 mr-1">R$</span>
                <span className="text-5xl font-black text-white tracking-tight">{plan.price}</span>
                <span className="text-gray-400 ml-2">/mês</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-300">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.highlight ? "text-orange-500" : "text-gray-500"}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-bold transition-all mt-auto cursor-pointer ${
                plan.highlight 
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25" 
                  : "bg-white text-black hover:bg-gray-200"
              }`}>
                Escolher {plan.name}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
