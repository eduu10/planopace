"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Shield,
  Activity,
  Globe,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import { useStravaConfig } from "@/stores/strava-config";

export default function AdminApiPage() {
  const { config, save, hydrate, getCallbackUrl, getAuthorizationUrl } = useStravaConfig();

  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookToken, setShowWebhookToken] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [formState, setFormState] = useState({
    clientId: "",
    clientSecret: "",
    callbackDomain: "http://localhost:3000",
    webhookVerifyToken: "",
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setFormState({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      callbackDomain: config.callbackDomain,
      webhookVerifyToken: config.webhookVerifyToken,
    });
  }, [config.clientId, config.clientSecret, config.callbackDomain, config.webhookVerifyToken]);

  const handleSave = () => {
    save({
      clientId: formState.clientId,
      clientSecret: formState.clientSecret,
      callbackDomain: formState.callbackDomain,
      webhookVerifyToken: formState.webhookVerifyToken,
    });
    setTestStatus("idle");
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    // Save first so testConnection uses latest values
    save({
      clientId: formState.clientId,
      clientSecret: formState.clientSecret,
    });
    const ok = await useStravaConfig.getState().testConnection();
    setTestStatus(ok ? "success" : "error");
    setTimeout(() => setTestStatus("idle"), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateWebhookToken = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormState((prev) => ({ ...prev, webhookVerifyToken: token }));
  };

  const callbackUrl = formState.callbackDomain
    ? `${formState.callbackDomain.replace(/\/+$/, "")}/auth/strava/callback`
    : "";

  const webhookUrl = formState.callbackDomain
    ? `${formState.callbackDomain.replace(/\/+$/, "")}/api/strava/webhook`
    : "";

  const isConfigured = formState.clientId && formState.clientSecret;

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
            <p className="text-gray-400 mt-0.5">Gerencie credenciais e integrações do Strava.</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 border flex items-center gap-3 ${
          isConfigured
            ? "bg-green-500/5 border-green-500/20"
            : "bg-yellow-500/5 border-yellow-500/20"
        }`}
      >
        {isConfigured ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
        )}
        <div>
          <p className={`text-sm font-medium ${isConfigured ? "text-green-400" : "text-yellow-400"}`}>
            {isConfigured ? "API Strava configurada" : "API Strava não configurada"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isConfigured
              ? "As credenciais estão salvas. Os usuários podem conectar suas contas Strava."
              : "Configure o Client ID e Client Secret para habilitar a integração com o Strava."}
          </p>
        </div>
      </motion.div>

      {/* Strava Credentials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold">Credenciais Strava OAuth</h2>
            </div>
            <a
              href="https://www.strava.com/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-400 transition-colors"
            >
              Abrir Strava API
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            Obtenha suas credenciais em{" "}
            <a
              href="https://www.strava.com/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              strava.com/settings/api
            </a>
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Client ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formState.clientId}
                onChange={(e) => setFormState((prev) => ({ ...prev, clientId: e.target.value }))}
                placeholder="Ex: 12345"
                className="flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
              />
              <button
                onClick={() => copyToClipboard(formState.clientId, "clientId")}
                className="px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08]"
                title="Copiar"
              >
                {copied === "clientId" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Client Secret</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={formState.clientSecret}
                  onChange={(e) => setFormState((prev) => ({ ...prev, clientSecret: e.target.value }))}
                  placeholder="Ex: a1b2c3d4e5f6..."
                  className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all pr-12"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(formState.clientSecret, "clientSecret")}
                className="px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08]"
                title="Copiar"
              >
                {copied === "clientSecret" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Nunca compartilhe seu Client Secret publicamente.
            </p>
          </div>
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
            <h2 className="text-lg font-bold">Domínio de Autorização</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            Configure o domínio para os callbacks OAuth do Strava.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Callback Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Domínio da Aplicação
            </label>
            <input
              type="text"
              value={formState.callbackDomain}
              onChange={(e) => setFormState((prev) => ({ ...prev, callbackDomain: e.target.value }))}
              placeholder="https://seudominio.com"
              className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
            <p className="text-xs text-gray-600 mt-1.5">
              Use <span className="text-gray-400 font-mono">http://localhost:3000</span> para desenvolvimento local.
            </p>
          </div>

          {/* Generated Callback URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-orange-500" />
                URL de Callback (Authorization Callback Domain)
              </div>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-orange-400 break-all">
                {callbackUrl || "—"}
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
              Cole esta URL no campo <strong className="text-gray-400">&quot;Authorization Callback Domain&quot;</strong> nas configurações da API do Strava.
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
                {webhookUrl || "—"}
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

      {/* Webhook Verify Token */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold">Webhook & Segurança</h2>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Webhook Verify Token
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showWebhookToken ? "text" : "password"}
                  value={formState.webhookVerifyToken}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, webhookVerifyToken: e.target.value }))
                  }
                  placeholder="Token de verificação do webhook"
                  className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all pr-12"
                />
                <button
                  onClick={() => setShowWebhookToken(!showWebhookToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showWebhookToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={generateWebhookToken}
                className="px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08]"
                title="Gerar token aleatório"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Token usado para verificar assinaturas de webhook do Strava. Clique no ícone para gerar um automaticamente.
            </p>
          </div>

          {/* Scopes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Escopos OAuth
            </label>
            <div className="flex flex-wrap gap-2">
              {config.scopes.map((scope) => (
                <span
                  key={scope}
                  className="px-3 py-1.5 bg-orange-500/10 text-orange-400 text-xs font-mono rounded-lg border border-orange-500/20"
                >
                  {scope}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Permissões solicitadas ao usuário durante a autorização OAuth.
            </p>
          </div>
        </div>
      </motion.div>

      {/* API Info & Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold">Informações da API</h2>
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

      {/* Authorization Preview */}
      {isConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
        >
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-bold">Preview da URL de Autorização</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
              <p className="text-xs text-gray-500 mb-2">URL gerada para o fluxo OAuth:</p>
              <p className="text-xs font-mono text-green-400 break-all leading-relaxed">
                {getAuthorizationUrl()}
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => copyToClipboard(getAuthorizationUrl(), "authUrl")}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors border border-white/[0.08]"
              >
                {copied === "authUrl" ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copiar URL
              </button>
              <a
                href={getAuthorizationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl text-sm transition-colors border border-orange-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                Testar OAuth
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
        >
          <Check className="w-4 h-4" />
          Salvar Configurações
        </button>
        <button
          onClick={handleTestConnection}
          disabled={!isConfigured || testStatus === "testing"}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors border ${
            testStatus === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : testStatus === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-white/5 border-white/[0.08] text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          {testStatus === "testing" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : testStatus === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : testStatus === "error" ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          {testStatus === "testing"
            ? "Testando..."
            : testStatus === "success"
            ? "Conexão OK!"
            : testStatus === "error"
            ? "Falha na conexão"
            : "Testar Conexão"}
        </button>
      </motion.div>
    </div>
  );
}
