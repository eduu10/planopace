"use client";

import { motion } from "framer-motion";

export default function Marquee() {
  return (
    <div className="relative flex overflow-hidden bg-orange-500 py-4 transform -skew-y-2 border-y-4 border-black z-10">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-4xl font-black text-black uppercase mx-8 italic tracking-tighter">
            CORRA MAIS RÁPIDO • TREINE MELHOR • SUPERE LIMITES • 
          </span>
        ))}
      </div>
      <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-4xl font-black text-black uppercase mx-8 italic tracking-tighter">
            CORRA MAIS RÁPIDO • TREINE MELHOR • SUPERE LIMITES • 
          </span>
        ))}
      </div>
    </div>
  );
}
