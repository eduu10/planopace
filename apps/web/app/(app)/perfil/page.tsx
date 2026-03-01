"use client";

import { motion } from "framer-motion";
import { Activity, CreditCard, Settings, LogOut, ChevronRight, Check, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PerfilPage() {
  const { user, hydrate, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6 py-4">
      {/* User Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold">
          {user?.avatar || "?"}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user?.name || "Usuário"}</h1>
          <p className="text-gray-400 text-sm">{user?.email || ""}</p>
          <span className="inline-block mt-1 bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
            Plano {user?.plan || "—"}
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
          <div><p className="text-gray-500">Idade</p><p className="font-medium">{user?.age || "—"} anos</p></div>
          <div><p className="text-gray-500">Peso</p><p className="font-medium">{user?.weight || "—"} kg</p></div>
          <div><p className="text-gray-500">Pace atual</p><p className="font-medium">{user?.pace || "—"}/km</p></div>
          <div><p className="text-gray-500">VDOT</p><p className="font-medium">{user?.vdot || "—"}</p></div>
          <div><p className="text-gray-500">Objetivo</p><p className="font-medium">{user?.goal || "—"}</p></div>
          <div><p className="text-gray-500">Dias/semana</p><p className="font-medium">{user?.daysPerWeek || "—"} dias</p></div>
        </div>
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
                {user?.strava ? (
                  <p className="text-xs text-green-400">Conectado</p>
                ) : (
                  <p className="text-xs text-gray-500">Não conectado</p>
                )}
              </div>
            </div>
            {user?.strava ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <button className="text-xs bg-[#FC4C02] text-white px-3 py-1 rounded-full font-bold">
                Conectar
              </button>
            )}
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
        {/* Admin link - only for admins */}
        {isAdmin() && (
          <Link
            href="/admin"
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-sm">Painel Admin</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </Link>
        )}

        <button
          className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${isAdmin() ? "border-t border-white/[0.06]" : ""}`}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <span className="text-sm">Gerenciar Assinatura</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-sm">Configurações</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-t border-white/[0.06]"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-500">Sair</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </motion.div>
    </div>
  );
}
