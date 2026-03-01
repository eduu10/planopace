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
  Settings2,
  Server,
  RefreshCw,
} from "lucide-react";

export default function AdminApiPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "configured" | "not_configured">("loading");

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const res = await fetch("/api/strava/auth");
      const data = await res.json();
      setApiStatus(data.url ? "configured" : "not_configured");
    } catch {
      setApiStatus("not_configured");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const callbackUrl = "https://planopace.vercel.app/auth/strava/callback";
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
            <p className="text-gray-400 mt-0.5">Integração Strava OAuth para todos os usuários.</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 border flex items-center gap-3 ${
          apiStatus === "configured"
            ? "bg-green-500/5 border-green-500/20"
            : apiStatus === "not_configured"
            ? "bg-yellow-500/5 border-yellow-500/20"
            : "bg-white/5 border-white/[0.06]"
        }`}
      >
        {apiStatus === "loading" ? (
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin shrink-0" />
        ) : apiStatus === "configured" ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
        )}
        <div>
          <p className={`text-sm font-medium ${
            apiStatus === "configured" ? "text-green-400" : apiStatus === "not_configured" ? "text-yellow-400" : "text-gray-400"
          }`}>
            {apiStatus === "loading"
              ? "Verificando configuração..."
              : apiStatus === "configured"
              ? "API Strava ativa — Usuários podem conectar suas contas"
              : "API Strava não configurada — Configure as variáveis de ambiente"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {apiStatus === "configured"
              ? "As credenciais estão configuradas no servidor. O botão \"Conectar Strava\" está funcional para todos os usuários."
              : "Adicione STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET nas variáveis de ambiente da Vercel."}
          </p>
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
            As credenciais ficam seguras no servidor — nunca expostas ao navegador do cliente.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {envVars.map((env) => (
            <div key={env.name} className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-mono font-bold text-orange-400">{env.name}</p>
                <button
                  onClick={() => copyToClipboard(env.name, env.name)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Copiar nome"
                >
                  {copied === env.name ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">{env.description}</p>
              <p className="text-xs text-gray-600 mt-1 font-mono">Ex: {env.example}</p>
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
            <h2 className="text-lg font-bold">Como Configurar</h2>
          </div>
        </div>

        <div className="p-6">
          <ol className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="font-medium">Crie uma aplicação no Strava</p>
                <p className="text-gray-500 mt-0.5">
                  Acesse{" "}
                  <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                    strava.com/settings/api
                  </a>{" "}
                  e registre sua aplicação.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="font-medium">Configure o Authorization Callback Domain</p>
                <p className="text-gray-500 mt-0.5">
                  No Strava, defina o callback domain como: <span className="text-orange-400 font-mono">planopace.vercel.app</span>
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="font-medium">Copie Client ID e Client Secret</p>
                <p className="text-gray-500 mt-0.5">
                  Anote o Client ID e Client Secret gerados pelo Strava.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <p className="font-medium">Adicione nas variáveis de ambiente da Vercel</p>
                <p className="text-gray-500 mt-0.5">
                  Vá em{" "}
                  <a href="https://vercel.com/eduu10s-projects/planopace/settings/environment-variables" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                    Vercel → Settings → Environment Variables
                  </a>{" "}
                  e adicione as variáveis acima. Depois faça um redeploy.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </motion.div>

      {/* Callback & Domain Configuration */}
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
          <p className="text-sm text-gray-500 mt-1 ml-8">
            URLs que devem ser configuradas na aplicação Strava.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Callback URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-orange-500" />
                Authorization Callback Domain
              </div>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-orange-400 break-all">
                {callbackUrl}
              </div>
              <button
                onClick={() => copyToClipboard(callbackUrl, "callbackUrl")}
                className="px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08] shrink-0"
                title="Copiar"
              >
                {copied === "callbackUrl" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Cole <strong className="text-gray-400">planopace.vercel.app</strong> no campo &quot;Authorization Callback Domain&quot; do Strava.
            </p>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-500" />
                URL do Webhook
              </div>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 break-all">
                {webhookUrl}
              </div>
              <button
                onClick={() => copyToClipboard(webhookUrl, "webhookUrl")}
                className="px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08] shrink-0"
                title="Copiar"
              >
                {copied === "webhookUrl" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Endpoint para receber eventos de atividades do Strava em tempo real.
            </p>
          </div>
        </div>
      </motion.div>

      {/* OAuth Scopes */}
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
          <div className="flex flex-wrap gap-2 mb-4">
            {["read", "activity:read_all"].map((scope) => (
              <span
                key={scope}
                className="px-3 py-1.5 bg-orange-500/10 text-orange-400 text-xs font-mono rounded-lg border border-orange-500/20"
              >
                {scope}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            <strong className="text-gray-400">read</strong> — Leitura de dados públicos do atleta.{" "}
            <strong className="text-gray-400">activity:read_all</strong> — Leitura de todas as atividades (corridas, pace, distância, FC, etc).
          </p>
        </div>
      </motion.div>

      {/* API Info & Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold">Limites da API Strava</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-xs text-gray-500 mb-1">Rate Limit (15 min)</p>
              <p className="text-lg font-bold font-mono">200 <span className="text-xs text-gray-500 font-normal">requisições</span></p>
            </div>
            <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-xs text-gray-500 mb-1">Rate Limit (diário)</p>
              <p className="text-lg font-bold font-mono">2.000 <span className="text-xs text-gray-500 font-normal">requisições</span></p>
            </div>
            <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-xs text-gray-500 mb-1">Base URL</p>
              <p className="text-sm font-mono text-gray-300">https://www.strava.com/api/v3</p>
            </div>
            <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-xs text-gray-500 mb-1">Token Exchange</p>
              <p className="text-sm font-mono text-gray-300">https://www.strava.com/oauth/token</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Refresh Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
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
