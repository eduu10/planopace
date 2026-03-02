"use client";

import { motion } from "framer-motion";
import { Activity, CreditCard, Settings, LogOut, ChevronRight, Check, Shield, Loader2, MapPin, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStrava } from "@/lib/useStrava";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function PerfilPage() {
  const { user, hydrate, logout, isAdmin } = useAuth();
  const { athlete, weekStats, activities, connected: stravaConnected, loading: stravaLoading, computeVDOT } = useStrava();
  const router = useRouter();
  const [connectingStrava, setConnectingStrava] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleConnectStrava = async () => {
    setConnectingStrava(true);
    try {
      const res = await fetch("/api/strava/auth");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro: API Strava não configurada. Contate o administrador.");
        setConnectingStrava(false);
      }
    } catch {
      alert("Erro ao conectar com Strava. Tente novamente.");
      setConnectingStrava(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const connected = stravaConnected;
  const vdot = computeVDOT();
  const totalKm = activities.reduce((sum, a) => sum + a.distanceMeters, 0) / 1000;
  const totalRuns = activities.length;
  const athleteWeight = athlete?.weight || user?.weight || 0;
  const athleteCity = athlete?.city || "";
  const athleteCountry = athlete?.country || "";
  const athleteProfile = athlete?.profile || "";
  const memberSince = athlete?.created_at ? new Date(athlete.created_at) : null;

  const displayName = connected && athlete
    ? `${athlete.firstname || ""} ${athlete.lastname || ""}`.trim()
    : user?.name || "Usuário";

  const displayAvatar = connected && athleteProfile && !athleteProfile.includes("avatar/athlete/large")
    ? athleteProfile
    : null;

  return (
    <div className="space-y-6 py-4">
      {/* User Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        {displayAvatar ? (
          <Image
            src={displayAvatar}
            alt={displayName}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold">
            {displayName.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{displayName}</h1>
          <p className="text-gray-400 text-sm">{user?.email || ""}</p>
          {athleteCity && (
            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {athleteCity}{athleteCountry ? `, ${athleteCountry}` : ""}
            </p>
          )}
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
        {stravaLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            <span className="ml-2 text-gray-400 text-xs">Carregando dados...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Peso</p>
              <p className="font-medium">{athleteWeight > 0 ? `${athleteWeight} kg` : "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">VDOT</p>
              <p className="font-medium">{vdot > 0 ? vdot : "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Pace médio (semana)</p>
              <p className="font-medium">{weekStats.avgPace !== "—" ? `${weekStats.avgPace}/km` : "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Km esta semana</p>
              <p className="font-medium">{weekStats.totalKm > 0 ? `${weekStats.totalKm} km` : "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Total de corridas</p>
              <p className="font-medium">{totalRuns > 0 ? totalRuns : "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Total (km)</p>
              <p className="font-medium">{totalKm > 0 ? `${Math.round(totalKm * 10) / 10} km` : "—"}</p>
            </div>
            {memberSince && (
              <div className="col-span-2">
                <p className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Membro desde
                </p>
                <p className="font-medium">
                  {memberSince.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        )}
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
                {connected || user?.strava ? (
                  <p className="text-xs text-green-400">Conectado{athlete ? ` — ${athlete.firstname}` : ""}</p>
                ) : (
                  <p className="text-xs text-gray-500">Não conectado</p>
                )}
              </div>
            </div>
            {stravaConnected || user?.strava ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <button
                onClick={handleConnectStrava}
                disabled={connectingStrava}
                className="text-xs bg-[#FC4C02] text-white px-3 py-1 rounded-full font-bold disabled:opacity-50 flex items-center gap-1.5"
              >
                {connectingStrava ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Conectar"
                )}
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
