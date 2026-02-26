"use client";

import { motion } from "framer-motion";
import { User, Activity, Link2, CreditCard, Settings, LogOut, ChevronRight, Check } from "lucide-react";

export default function PerfilPage() {
  return (
    <div className="space-y-6 py-4">
      {/* User Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold">
          J
        </div>
        <div>
          <h1 className="text-xl font-bold">João Demo</h1>
          <p className="text-gray-400 text-sm">demo@planopace.com</p>
          <span className="inline-block mt-1 bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
            Plano Pro
          </span>
        </div>
      </motion.div>

      {/* Athlete Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#141415] rounded-2xl p-5 border border-white/[0.06]"
      >
        <h2 className="text-sm font-bold mb-4">Perfil do Atleta</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Idade</p><p className="font-medium">32 anos</p></div>
          <div><p className="text-gray-500">Peso</p><p className="font-medium">75 kg</p></div>
          <div><p className="text-gray-500">Pace atual</p><p className="font-medium">5:48/km</p></div>
          <div><p className="text-gray-500">VDOT</p><p className="font-medium">38</p></div>
          <div><p className="text-gray-500">Objetivo</p><p className="font-medium">10k sub-50min</p></div>
          <div><p className="text-gray-500">Dias/semana</p><p className="font-medium">4 dias</p></div>
          <div><p className="text-gray-500">FC Máx</p><p className="font-medium">185 bpm</p></div>
          <div><p className="text-gray-500">FC Repouso</p><p className="font-medium">55 bpm</p></div>
        </div>
        <button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
          Editar perfil
        </button>
      </motion.div>

      {/* Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <h2 className="text-sm font-bold p-5 pb-3">Integrações</h2>
        <div className="border-t border-white/[0.06]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">Strava</p>
                <p className="text-xs text-green-400">Conectado</p>
              </div>
            </div>
            <Check className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        {[
          { icon: CreditCard, label: "Gerenciar Assinatura", color: "text-orange-500" },
          { icon: Settings, label: "Configurações", color: "text-gray-400" },
          { icon: LogOut, label: "Sair", color: "text-red-500" },
        ].map((item, i) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
              i > 0 ? "border-t border-white/[0.06]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        ))}
      </motion.div>
    </div>
  );
}
