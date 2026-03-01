"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Activity } from "lucide-react";
import { useStravaConfig } from "@/stores/strava-config";

type CallbackStatus = "loading" | "success" | "error";

export default function StravaCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { config, hydrate } = useStravaConfig();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Processando autorização do Strava...");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const scope = searchParams.get("scope");

    if (error) {
      setStatus("error");
      setMessage(
        error === "access_denied"
          ? "Você negou o acesso ao Strava. Tente novamente quando estiver pronto."
          : `Erro na autorização: ${error}`
      );
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Código de autorização não encontrado. Tente conectar novamente.");
      return;
    }

    exchangeToken(code, scope || "");
  }, [searchParams]);

  const exchangeToken = async (code: string, scope: string) => {
    try {
      const stravaConfig = useStravaConfig.getState().config;

      if (!stravaConfig.clientId || !stravaConfig.clientSecret) {
        setStatus("error");
        setMessage("Credenciais da API Strava não configuradas. Configure no painel admin.");
        return;
      }

      const res = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: stravaConfig.clientId,
          client_secret: stravaConfig.clientSecret,
          code,
          grant_type: "authorization_code",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();

      // Store the tokens (in a real app, send to backend)
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "planopace_strava_tokens",
          JSON.stringify({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
            athleteId: data.athlete?.id,
            athleteName: `${data.athlete?.firstname || ""} ${data.athlete?.lastname || ""}`.trim(),
            scope,
            connectedAt: new Date().toISOString(),
          })
        );
      }

      setStatus("success");
      setMessage(
        `Strava conectado com sucesso! Bem-vindo, ${data.athlete?.firstname || "atleta"}.`
      );

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Erro ao trocar o token. Verifique as credenciais e tente novamente."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#141415] rounded-2xl border border-white/[0.06] p-8 text-center">
          {/* Strava Logo */}
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl ${
                status === "success"
                  ? "bg-green-500/10"
                  : status === "error"
                  ? "bg-red-500/10"
                  : "bg-orange-500/10"
              }`}
            >
              {status === "loading" ? (
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-white">Strava Connect</h1>
          </div>

          {/* Status Message */}
          <p
            className={`text-sm mt-3 ${
              status === "success"
                ? "text-green-400"
                : status === "error"
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {message}
          </p>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {status === "success" && (
              <p className="text-xs text-gray-500">Redirecionando para o dashboard em 3 segundos...</p>
            )}
            {status === "error" && (
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-white/[0.08]"
                >
                  Voltar ao Dashboard
                </button>
                <button
                  onClick={() => router.push("/perfil")}
                  className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-4">
          PLANO<span className="text-orange-500">PACE</span> — Integração Strava OAuth 2.0
        </p>
      </div>
    </div>
  );
}
