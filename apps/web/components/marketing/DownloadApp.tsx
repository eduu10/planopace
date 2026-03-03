"use client";

import { motion } from "framer-motion";
import { Download, Smartphone, Zap, Activity, BarChart3 } from "lucide-react";

const APK_URL = "https://expo.dev/artifacts/eas/jUkYdrSGcJuSm1GuvVmeiY.apk";

export default function DownloadApp() {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Coluna 1 - Texto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-widest mb-4">
              Novo
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
              Seu treino no{" "}
              <span className="text-orange-500">bolso.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              Baixe o app do Plano Pace e tenha acesso ao seu plano de treino,
              métricas de evolução e sincronização com Strava direto no seu celular.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { icon: Zap, text: "Treinos diários com notificações" },
                { icon: Activity, text: "Sync automático com Strava" },
                { icon: BarChart3, text: "Métricas de evolução em tempo real" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-gray-300">{text}</span>
                </div>
              ))}
            </div>

            <a
              href={APK_URL}
              download
              className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25"
            >
              <Download className="w-6 h-6" />
              Baixar para Android
            </a>
            <p className="text-gray-500 text-sm mt-3">
              APK v1.0.0 &middot; Android 8.0+
            </p>
          </motion.div>

          {/* Coluna 2 - Mockup do App */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-orange-500/20 rounded-[3rem] blur-[60px] scale-90" />

              {/* Phone frame */}
              <div className="relative w-[280px] sm:w-[300px] bg-zinc-900 rounded-[2.5rem] border-[3px] border-zinc-700 p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-900 rounded-b-2xl z-20 border-b-[3px] border-x-[3px] border-zinc-700" />

                {/* Screen */}
                <div className="bg-[#0A0A0B] rounded-[2rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 pt-8 pb-2">
                    <span className="text-white text-xs font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-white/60 rounded-sm" />
                      <div className="w-2 h-2 bg-white/60 rounded-full" />
                      <div className="w-6 h-3 bg-green-500 rounded-sm relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 -right-[3px] w-[2px] h-[4px] bg-green-500 rounded-r-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App content mockup */}
                  <div className="px-4 pb-4">
                    {/* Greeting */}
                    <p className="text-gray-400 text-[10px] mb-0.5">Bom dia</p>
                    <h3 className="text-white font-bold text-sm mb-3">Vamos treinar!</h3>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-zinc-800/80 rounded-xl p-2.5">
                        <p className="text-[9px] text-gray-400">Distância</p>
                        <p className="text-white font-bold text-base">42.5 km</p>
                        <p className="text-green-400 text-[9px]">+12% sem.</p>
                      </div>
                      <div className="bg-zinc-800/80 rounded-xl p-2.5">
                        <p className="text-[9px] text-gray-400">Pace Médio</p>
                        <p className="text-white font-bold text-base">5:32</p>
                        <p className="text-green-400 text-[9px]">-8s sem.</p>
                      </div>
                    </div>

                    {/* Today's workout */}
                    <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 rounded-xl p-3 border border-orange-500/20 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-orange-400 text-[10px] font-bold uppercase">Treino de Hoje</span>
                        <span className="bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">INTERVALADO</span>
                      </div>
                      <p className="text-white text-xs font-semibold">8x 400m @ 4:20/km</p>
                      <p className="text-gray-400 text-[10px]">Recuperação: 200m trote</p>
                    </div>

                    {/* Mini chart */}
                    <div className="bg-zinc-800/80 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 mb-2">Evolução Semanal</p>
                      <div className="flex items-end gap-1 h-12">
                        {[40, 55, 35, 70, 60, 80, 65].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm"
                            style={{
                              height: `${h}%`,
                              backgroundColor: i === 5 ? "#f97316" : "#3f3f46",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[8px] text-gray-500">Seg</span>
                        <span className="text-[8px] text-gray-500">Dom</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom tab bar */}
                  <div className="flex justify-around items-center py-2 px-2 border-t border-zinc-800 bg-zinc-900/50">
                    {[
                      { label: "Home", active: true },
                      { label: "Treino", active: false },
                      { label: "Corridas", active: false },
                      { label: "Perfil", active: false },
                    ].map((tab) => (
                      <div key={tab.label} className="flex flex-col items-center gap-0.5">
                        <div className={`w-5 h-5 rounded-md ${tab.active ? "bg-orange-500" : "bg-zinc-700"}`} />
                        <span className={`text-[8px] ${tab.active ? "text-orange-500" : "text-gray-500"}`}>
                          {tab.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center mt-2">
                  <div className="w-28 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
