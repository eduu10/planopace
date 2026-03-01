"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-7xl font-black text-black mb-8 italic tracking-tighter leading-none">
            PRONTO PARA <br />
            QUEBRAR RECORDES?
          </h2>
          <p className="text-xl text-black/80 font-medium max-w-2xl mx-auto mb-10">
            Junte-se a milhares de corredores que já estão treinando de forma inteligente.
            Teste grátis por 7 dias.
          </p>

          <Link href="/registro" className="bg-black text-white px-10 py-5 rounded-full text-xl font-bold uppercase tracking-wide hover:bg-zinc-900 transition-all transform hover:scale-105 shadow-2xl flex items-center mx-auto w-fit">
            Começar Agora
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>

          <p className="mt-6 text-sm text-black/60 font-mono uppercase tracking-widest">
            Sem cartão de crédito necessário
          </p>
        </motion.div>
      </div>
    </section>
  );
}
