"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Activity } from "lucide-react";

type CallbackStatus = "loading" | "success" | "error";

function StravaCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Processando autorização do Strava...");

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
      const res = await fetch("/api/strava/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();

      // Save Strava tokens
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "planopace_strava_tokens",
          JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: data.expiresAt,
            athlete: data.athlete,
            scope,
            connectedAt: new Date().toISOString(),
          })
        );

        // Update existing user or create session from Strava data
        const storedUser = localStorage.getItem("planopace_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.strava = true;
          user.stravaAthlete = data.athlete;
          localStorage.setItem("planopace_user", JSON.stringify(user));
        } else {
          // Create user session from Strava athlete data
          const athleteName = `${data.athlete?.firstName || ""} ${data.athlete?.lastName || ""}`.trim() || "Atleta";
          const newUser = {
            id: `strava-${data.athlete?.id || Date.now()}`,
            name: athleteName,
            email: `strava_${data.athlete?.id}@planopace.com`,
            role: "user",
            plan: "Mensal",
            avatar: athleteName.charAt(0).toUpperCase(),
            age: 0,
            weight: 0,
            pace: "—",
            vdot: 0,
            goal: "Definir objetivo",
            daysPerWeek: 4,
            strava: true,
            stravaAthlete: data.athlete,
          };
          localStorage.setItem("planopace_user", JSON.stringify(newUser));
        }
      }

      setStatus("success");
      setMessage(
        `Strava conectado com sucesso! Bem-vindo, ${data.athlete?.firstName || "atleta"}.`
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Erro ao conectar com o Strava. Tente novamente."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#141415] rounded-2xl border border-white/[0.06] p-8 text-center">
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

          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-white">Strava Connect</h1>
          </div>

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

        <p className="text-center text-xs text-gray-600 mt-4">
          PLANO<span className="text-orange-500">PACE</span> — Integração Strava OAuth 2.0
        </p>
      </div>
    </div>
  );
}

export default function StravaCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      }
    >
      <StravaCallbackContent />
    </Suspense>
  );
}
