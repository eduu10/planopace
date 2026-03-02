"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Activity,
  Globe,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Server,
  RefreshCw,
} from "lucide-react";

export default function AdminApiPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [stravaStatus, setStravaStatus] = useState<"loading" | "configured" | "not_configured">("loading");

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const res = await fetch("/api/strava/auth");
      const data = await res.json();
      setStravaStatus(data.url ? "configured" : "not_configured");
    } catch {
      setStravaStatus("not_configured");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const stravaCallbackUrl = "https://planopace.vercel.app/auth/strava/callback";
  const webhookUrl = "https://planopace.vercel.app/api/strava/webhook";

  const envVars = [
    { name: "STRAVA_CLIENT_ID", description: "Client ID da aplicação Strava", example: "12345" },
    { name: "STRAVA_CLIENT_SECRET", description: "Client Secret da aplicação Strava", example: "a1b2c3d4e5f6..." },
    { name: "NEXT_PUBLIC_APP_URL", description: "URL da aplicação em produção", example: "https://planopace.vercel.app" },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2.5 rounded-xl">
            <Key className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Configurações da API</h1>
            <p className="text-gray-400 mt-0.5">Integração Strava para todos os usuários.</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 border flex items-center gap-3 ${
          stravaStatus === "configured"
            ? "bg-green-500/5 border-green-500/20"
            : stravaStatus === "not_configured"
            ? "bg-yellow-500/5 border-yellow-500/20"
            : "bg-white/5 border-white/[0.06]"
        }`}
      >
        {stravaStatus === "loading" ? (
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin shrink-0" />
        ) : stravaStatus === "configured" ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            stravaStatus === "configured" ? "text-green-400" : stravaStatus === "not_configured" ? "text-yellow-400" : "text-gray-400"
          }`}>
            {stravaStatus === "loading" ? "Verificando Strava..." : stravaStatus === "configured" ? "Strava ativo" : "Strava não configurado"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {stravaStatus === "configured"
              ? "Usuários podem conectar suas contas Strava."
              : "Adicione STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET na Vercel."}
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#FC4C02]/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        </div>
      </motion.div>

      {/* Environment Variables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold">Variáveis de Ambiente (Vercel)</h2>
            </div>
            <a
              href="https://vercel.com/eduu10s-projects/planopace/settings/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-400 transition-colors"
            >
              Abrir Vercel Settings
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            As credenciais ficam seguras no servidor — nunca expostas ao navegador.
          </p>
        </div>

        <div className="p-6 space-y-3">
          {envVars.map((env) => (
            <div key={env.name} className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-mono font-bold text-orange-400">{env.name}</p>
                <button onClick={() => copyToClipboard(env.name, env.name)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  {copied === env.name ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">{env.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How to Configure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold">Como Configurar o Strava</h2>
          </div>
        </div>

        <div className="p-6">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">1</span>
              <p className="text-gray-400">Acesse <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">strava.com/settings/api</a> e registre a aplicação.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">2</span>
              <p className="text-gray-400">Callback domain: <span className="text-orange-400 font-mono">planopace.vercel.app</span></p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">3</span>
              <p className="text-gray-400">Adicione STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET na Vercel e faça redeploy.</p>
            </li>
          </ol>
        </div>
      </motion.div>

      {/* URLs de Integração */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">URLs de Integração</h2>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {[
            { label: "Strava Callback URL", url: stravaCallbackUrl, key: "stravaCallback", color: "text-orange-400", iconColor: "text-orange-500" },
            { label: "Webhook URL (Strava)", url: webhookUrl, key: "webhookUrl", color: "text-blue-400", iconColor: "text-blue-500" },
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Link2 className={`w-4 h-4 ${item.iconColor}`} />
                  {item.label}
                </div>
              </label>
              <div className="flex gap-2">
                <div className={`flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono ${item.color} break-all`}>
                  {item.url}
                </div>
                <button
                  onClick={() => copyToClipboard(item.url, item.key)}
                  className="px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08] shrink-0"
                >
                  {copied === item.key ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scopes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold">Escopos & Permissões</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-xs text-gray-500 font-bold mb-2">Strava OAuth Scopes</p>
          <div className="flex flex-wrap gap-2">
            {["read", "activity:read_all"].map((s) => (
              <span key={s} className="px-3 py-1.5 bg-orange-500/10 text-orange-400 text-xs font-mono rounded-lg border border-orange-500/20">{s}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Refresh */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button
          onClick={checkApiStatus}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/[0.08]"
        >
          <RefreshCw className="w-4 h-4" />
          Verificar Status da API
        </button>
      </motion.div>
    </div>
  );
}
