"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1552674605-469523170d9e?q=80&w=2070&auto=format&fit=crop"
          alt="Runner sprinting"
          className="w-full h-full object-cover opacity-60"
        />
      </div>

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
              <span className="block mt-2 text-white font-bold">Sem humanos. Apenas dados.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-full text-lg font-black uppercase tracking-wide transition-all transform hover:scale-105 flex items-center justify-center cursor-pointer">
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full text-lg font-bold uppercase tracking-wide text-white border border-white/20 hover:bg-white/10 transition-all cursor-pointer">
                Ver Planos
              </button>
            </div>
          </motion.div>

          {/* Couple Running Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10">
              {/* Using a high energy image and blending it slightly */}
              <div className="relative rounded-3xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-white/10 shadow-2xl shadow-orange-900/20">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                 <img 
                   src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
                   alt="Casal correndo com energia"
                   className="w-full h-auto object-cover"
                 />
              </div>
              
              {/* Energy Glow Effects */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -z-10" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-600/20 rounded-full blur-[80px] -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
