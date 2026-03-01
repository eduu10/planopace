"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Como funciona a planilha personalizada?",
    answer:
      "Ao se cadastrar, você responde algumas perguntas sobre seu nível, objetivo e disponibilidade. O sistema gera uma planilha de treinos 100% personalizada e ajusta automaticamente semana a semana com base nos seus dados reais do Strava.",
  },
  {
    question: "Preciso ter conta no Strava?",
    answer:
      "Recomendamos fortemente, pois a integração com o Strava permite ajustes automáticos baseados nas suas corridas reais. Mas você pode usar o Plano Pace mesmo sem Strava — basta registrar seus treinos manualmente.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim! Não existe fidelidade. Você pode cancelar quando quiser diretamente pelo painel, sem burocracia. O acesso continua até o fim do período já pago.",
  },
  {
    question: "O plano anual realmente vem com camisa?",
    answer:
      "Sim! Ao assinar o plano anual, você recebe uma camisa de corrida exclusiva da Plano Pace. Após a confirmação do pagamento, ela é enviada em até 15 dias úteis.",
  },
  {
    question: "Serve para iniciantes?",
    answer:
      "Com certeza! O Plano Pace se adapta ao seu nível. Se você está começando agora, o sistema vai criar treinos leves e progressivos. Se já é experiente, os treinos serão mais intensos e focados no seu objetivo.",
  },
  {
    question: "Como funcionam os ajustes semanais?",
    answer:
      "Toda semana o sistema analisa seus dados (pace, frequência cardíaca, distância, consistência) e recalcula a planilha. Se você treinou mais do que o previsto, ele adapta. Se ficou parado, ele ajusta a carga para evitar lesões.",
  },
  {
    question: "Qual a diferença para uma assessoria tradicional?",
    answer:
      "Uma assessoria tradicional custa entre R$200 e R$500/mês e depende da disponibilidade do treinador. O Plano Pace usa tecnologia para entregar ajustes em tempo real, 24h por dia, por uma fração do preço — com métricas avançadas que muitas assessorias não oferecem.",
  },
  {
    question: "Consigo me preparar para provas (5K, 10K, meia, maratona)?",
    answer:
      "Sim! Você pode definir uma prova como objetivo e o sistema vai montar um plano de preparação específico, com periodização, estimativa de pace e ajustes progressivos até o dia da prova.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-black relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Perguntas <span className="text-orange-500">Frequentes</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Tudo que você precisa saber antes de começar.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-950 border border-white/[0.06] hover:border-white/10 transition-colors text-left"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-orange-500" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 pt-3 text-gray-400 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
