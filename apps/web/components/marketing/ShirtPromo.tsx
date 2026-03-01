"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import Link from "next/link";

export default function ShirtPromo() {
  const [gender, setGender] = useState<"masc" | "fem">("masc");

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-orange-500/10 p-2 rounded-xl">
                <Gift className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-orange-500 font-mono text-sm tracking-widest uppercase font-bold">
                Exclusivo Plano Anual
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Vista a camisa da{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                equipe.
              </span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-lg">
              Quem assina o plano anual recebe uma camisa de corrida exclusiva da Plano Pace.
              Feita para performance, leve e com design que representa a comunidade de corredores que treinam com inteligência.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Tecido dry-fit de alta performance",
                "Design exclusivo Plano Pace",
                "Envio grátis para todo o Brasil",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/registro"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              Assinar Plano Anual — R$ 299,90/ano
            </Link>
            <p className="text-xs text-gray-500 mt-3">Ganhe 2 meses grátis + camisa de corrida</p>
          </motion.div>

          {/* Shirt Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="relative flex items-end justify-center">
              <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-[80px] scale-75 pointer-events-none" />
              {gender === "masc" && (
                <img
                  src="/bombado.png"
                  alt="Modelo masculino Plano Pace"
                  className="relative z-10 w-64 md:w-80 lg:w-96 h-auto drop-shadow-[0_8px_40px_rgba(249,115,22,0.2)] transition-all duration-500"
                />
              )}
              {gender === "fem" && (
                <img
                  src="/ruiva.png"
                  alt="Modelo feminina Plano Pace"
                  className="relative z-10 w-64 md:w-80 lg:w-96 h-auto drop-shadow-[0_8px_40px_rgba(249,115,22,0.2)] transition-all duration-500"
                />
              )}
              <img
                key={gender}
                src={gender === "masc" ? "/camisamasculina.png" : "/camisaf.png"}
                alt={`Camisa ${gender === "masc" ? "masculina" : "feminina"} Plano Pace`}
                className="relative z-20 w-48 md:w-56 lg:w-64 h-auto -ml-10 drop-shadow-[0_8px_40px_rgba(249,115,22,0.3)] transition-all duration-500"
              />
            </div>

            {/* Gender Toggle */}
            <div className="flex gap-2 mt-8">
              <button
                onClick={() => setGender("masc")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  gender === "masc"
                    ? "bg-orange-500 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                Masculina
              </button>
              <button
                onClick={() => setGender("fem")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  gender === "fem"
                    ? "bg-orange-500 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                Feminina
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
