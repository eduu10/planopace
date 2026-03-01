"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center bg-black pt-24 lg:pt-0">
      {/* Dark background with subtle gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-zinc-950 to-black" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-orange-500 p-1 rounded">
                <Zap className="text-black w-4 h-4 fill-current" />
              </div>
              <span className="text-orange-500 font-mono text-sm tracking-widest uppercase font-bold">
                Treinador Virtual Autônomo
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 italic">
              CORRA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 pr-4 inline-block">
                ALÉM DOS
              </span> <br />
              LIMITES
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-lg leading-relaxed border-l-4 border-orange-500 pl-6">
              Planilhas personalizadas por IA, integração direta com Strava e evolução em tempo real.
              <span className="block mt-2 text-white font-bold">Sua evolução no piloto automático.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/registro" className="group bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-full text-lg font-black uppercase tracking-wide transition-all transform hover:scale-105 flex items-center justify-center cursor-pointer">
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/precos" className="px-8 py-4 rounded-full text-lg font-bold uppercase tracking-wide text-white border border-white/20 hover:bg-white/10 transition-all cursor-pointer text-center">
                Ver Planos
              </Link>
            </div>
          </motion.div>

          {/* Couple Running Image — transparent bg, bleeds into marquee */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative self-end"
          >
            <div className="relative z-10 mb-[-100px] mt-[-40px] lg:mt-0 lg:mb-[-180px] max-w-sm mx-auto lg:max-w-none">
              <img
                src="/modelos1.png"
                alt="Casal correndo com roupa Plano Pace"
                className="w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(249,115,22,0.25)]"
                style={{ mixBlendMode: "normal" }}
              />
              {/* Energy Glow Effects */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/15 rounded-full blur-[100px] -z-10" />
              <div className="absolute -bottom-10 -left-20 w-64 h-64 bg-red-600/15 rounded-full blur-[100px] -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
