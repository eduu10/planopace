"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, Mail, Activity, Ban, Eye } from "lucide-react";

const users = [
  { id: 1, name: "João Demo", email: "demo@planopace.com", plan: "Semestral", status: "active", runs: 42, km: 284.5, joined: "15 Jan 2026", strava: true },
  { id: 2, name: "Maria Santos", email: "maria@email.com", plan: "Mensal", status: "active", runs: 38, km: 256.2, joined: "20 Jan 2026", strava: true },
  { id: 3, name: "Pedro Oliveira", email: "pedro@email.com", plan: "Mensal", status: "active", runs: 15, km: 98.3, joined: "01 Fev 2026", strava: false },
  { id: 4, name: "Ana Costa", email: "ana@email.com", plan: "Anual", status: "active", runs: 56, km: 412.8, joined: "10 Dez 2025", strava: true },
  { id: 5, name: "Lucas Silva", email: "lucas@email.com", plan: "Semestral", status: "active", runs: 28, km: 178.4, joined: "05 Fev 2026", strava: true },
  { id: 6, name: "Julia Souza", email: "julia@email.com", plan: "Mensal", status: "trial", runs: 3, km: 15.2, joined: "23 Fev 2026", strava: false },
  { id: 7, name: "Carlos Mendes", email: "carlos@email.com", plan: "Anual", status: "active", runs: 89, km: 623.1, joined: "15 Nov 2025", strava: true },
  { id: 8, name: "Fernanda Lima", email: "fernanda@email.com", plan: "Mensal", status: "cancelled", runs: 12, km: 67.8, joined: "01 Jan 2026", strava: false },
  { id: 9, name: "Ricardo Souza", email: "ricardo@email.com", plan: "Semestral", status: "active", runs: 45, km: 312.7, joined: "20 Dez 2025", strava: true },
  { id: 10, name: "Camila Rocha", email: "camila@email.com", plan: "Mensal", status: "trial", runs: 1, km: 5.2, joined: "25 Fev 2026", strava: false },
];

const planColors: Record<string, string> = {
  Mensal: "bg-gray-500/20 text-gray-400",
  Semestral: "bg-orange-500/20 text-orange-400",
  Anual: "bg-purple-500/20 text-purple-400",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  trial: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  trial: "Trial",
  cancelled: "Cancelado",
};

export default function AdminUsuarios() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Usuários</h1>
        <p className="text-gray-400 mt-1">{users.length} usuários cadastrados</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-[#141415] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <button className="bg-[#141415] border border-white/[0.06] px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#141415] rounded-2xl border border-white/[0.06] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Ver perfil">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Enviar email">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${planColors[user.plan]}`}>
                {user.plan}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[user.status]}`}>
                {statusLabels[user.status]}
              </span>
              {user.strava && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#FC4C02]/20 text-[#FC4C02] flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Strava
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{user.runs} corridas &middot; {user.km} km</span>
              <span>{user.joined}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden hidden md:block"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-white/[0.06]">
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Plano</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Corridas</th>
                <th className="px-6 py-4 font-medium">Km Total</th>
                <th className="px-6 py-4 font-medium">Strava</th>
                <th className="px-6 py-4 font-medium">Cadastro</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${planColors[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[user.status]}`}>
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{user.runs}</td>
                  <td className="px-6 py-4 font-mono">{user.km}</td>
                  <td className="px-6 py-4">
                    {user.strava ? (
                      <Activity className="w-4 h-4 text-[#FC4C02]" />
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Ver perfil">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white" title="Enviar email">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
