"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Globe,
  Server,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

type AsaasStatus = "loading" | "configured" | "not_configured";

export default function AdminAsaasPage() {
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<AsaasStatus>("loading");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; error?: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [configSource, setConfigSource] = useState<string>("none");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${apiUrl}/billing/webhook`;

  useEffect(() => {
    checkConfig();
  }, []);

  const getToken = () => {
    const stored = localStorage.getItem("planopace_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.token || "";
    }
    return "";
  };

  const checkConfig = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${apiUrl}/billing/config`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setStatus(data.configured ? "configured" : "not_configured");
      setConfigSource(data.source || "none");
      if (data.environment) setEnvironment(data.environment);
    } catch {
      setStatus("not_configured");
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${apiUrl}/billing/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ apiKey: apiKey.trim(), environment }),
      });
      if (res.ok) {
        setSaved(true);
        setStatus("configured");
        setConfigSource("database");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${apiUrl}/billing/config/test`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ connected: false, error: "Não foi possível conectar" });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2.5 rounded-xl">
            <Banknote className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">API Asaas</h1>
            <p className="text-gray-400 mt-0.5">Configuração do checkout transparente de pagamentos.</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 border flex items-center gap-3 ${
          status === "configured"
            ? "bg-green-500/5 border-green-500/20"
            : status === "not_configured"
            ? "bg-yellow-500/5 border-yellow-500/20"
            : "bg-white/5 border-white/[0.06]"
        }`}
      >
        {status === "loading" ? (
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin shrink-0" />
        ) : status === "configured" ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            status === "configured" ? "text-green-400" : status === "not_configured" ? "text-yellow-400" : "text-gray-400"
          }`}>
            {status === "loading" ? "Verificando Asaas..." : status === "configured" ? "Asaas configurado" : "Asaas não configurado"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {status === "configured"
              ? `Chave carregada via ${configSource === "database" ? "painel admin" : "variável de ambiente"}.`
              : "Adicione sua API Key abaixo para ativar os pagamentos."}
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <Banknote className="w-4 h-4 text-green-500" />
        </div>
      </motion.div>

      {/* API Key Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold">Credenciais</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            Insira sua API Key do Asaas. A chave é armazenada de forma segura no servidor.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Environment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ambiente</label>
            <div className="flex gap-3">
              <button
                onClick={() => setEnvironment("sandbox")}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  environment === "sandbox"
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-white/5 border-white/[0.08] text-gray-400 hover:bg-white/10"
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Sandbox (Testes)
              </button>
              <button
                onClick={() => setEnvironment("production")}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  environment === "production"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-white/5 border-white/[0.08] text-gray-400 hover:bg-white/10"
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Produção
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="$aact_..."
                className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Encontre sua API Key em{" "}
              <a
                href="https://www.asaas.com/config/index#tab_api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline"
              >
                Asaas &gt; Configurações &gt; Integrações
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Credenciais"}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || status !== "configured"}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-medium rounded-xl transition-all border border-white/[0.08]"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`rounded-xl p-4 border ${
              testResult.connected
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}>
              <div className="flex items-center gap-2">
                {testResult.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${testResult.connected ? "text-green-400" : "text-red-400"}`}>
                  {testResult.connected ? "Conexão com Asaas OK!" : "Falha na conexão"}
                </span>
              </div>
              {testResult.error && (
                <p className="text-xs text-red-400/80 mt-1 ml-6">{testResult.error}</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Webhook URL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Webhook</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            Configure esta URL no painel do Asaas para receber notificações de pagamento.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL do Webhook</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-mono text-blue-400 break-all">
                {webhookUrl}
              </div>
              <button
                onClick={() => copyToClipboard(webhookUrl, "webhook")}
                className="px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08] shrink-0"
              >
                {copied === "webhook" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-gray-500 font-bold mb-2">Eventos recomendados:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "PAYMENT_RECEIVED",
                "PAYMENT_CONFIRMED",
                "PAYMENT_OVERDUE",
                "PAYMENT_DELETED",
                "PAYMENT_REFUNDED",
                "PAYMENT_CREATED",
              ].map((evt) => (
                <span
                  key={evt}
                  className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono rounded-lg border border-blue-500/20"
                >
                  {evt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* How to Configure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold">Como Configurar</h2>
            </div>
            <a
              href="https://www.asaas.com/config/index#tab_api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-400 transition-colors"
            >
              Abrir Asaas
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="p-6">
          <ol className="space-y-3 text-sm">
            {[
              "Crie uma conta no Asaas (asaas.com) ou use o sandbox para testes.",
              "Vá em Configurações > Integrações > API e copie sua API Key.",
              "Cole a API Key acima e selecione o ambiente (Sandbox ou Produção).",
              "Clique em Salvar e depois teste a conexão.",
              "Configure o Webhook no Asaas com a URL acima e selecione os eventos.",
              "Pronto! O checkout transparente estará ativo para PIX, Cartão e Boleto.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-400">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>

      {/* Pricing Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold">Planos Configurados</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Mensal", price: "R$ 29,90", cycle: "Mensal", tier: "PRO" },
              { name: "Semestral", price: "R$ 149,90", cycle: "Semestral", tier: "PRO" },
              { name: "Anual", price: "R$ 299,90", cycle: "Anual", tier: "ELITE" },
            ].map((p) => (
              <div key={p.name} className="bg-[#0A0A0B] rounded-xl p-4 border border-white/[0.06]">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-2xl font-black text-orange-500 mt-1">{p.price}</p>
                <p className="text-xs text-gray-500 mt-1">Ciclo: {p.cycle}</p>
                <p className="text-xs text-gray-500">Tier: {p.tier}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Os preços são definidos no código. Para alterar, edite os valores em billing.service.ts.
          </p>
        </div>
      </motion.div>

      {/* Refresh */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button
          onClick={checkConfig}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/[0.08]"
        >
          <RefreshCw className="w-4 h-4" />
          Verificar Status
        </button>
      </motion.div>
    </div>
  );
}
