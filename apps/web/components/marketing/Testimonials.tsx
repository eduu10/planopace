"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Mendes",
    role: "Maratonista Amador",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
    quote: "Eu estava estagnado nos 21k há 2 anos. Em 3 meses de Plano Pace, baixei meu tempo em 12 minutos. A adaptação automática é surreal."
  },
  {
    name: "Fernanda Lima",
    role: "Iniciante nos 5k",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
    quote: "Nunca consegui seguir planilhas de internet. O Plano Pace ajustou o treino quando fiquei doente e não perdi o ritmo. Sensacional."
  },
  {
    name: "Ricardo Souza",
    role: "Triatleta",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop",
    quote: "A integração com o Strava é perfeita. Não preciso ficar digitando nada. Termino o treino e o sistema já recalcula minha semana."
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Quem usa, <span className="text-orange-500">Evolui</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900 p-8 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <p className="text-gray-300 mb-8 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                />
                <div className="ml-4">
                  <h4 className="text-white font-bold">{testimonial.name}</h4>
                  <span className="text-gray-500 text-sm">{testimonial.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
