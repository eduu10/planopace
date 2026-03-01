"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "saved" | "error" | "empty";

export default function ReceberVitoriaPage() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    try {
      // Read photo data from window.name (set by planopace-filter before redirect)
      const raw = window.name;
      if (!raw) {
        setStatus("empty");
        return;
      }

      const data = JSON.parse(raw);
      if (data?.type !== "PLANOPACE_FILTER_PHOTO" || !data?.imageData) {
        setStatus("empty");
        return;
      }

      // Clear window.name immediately so it doesn't get reused
      window.name = "";

      // Read existing victories from localStorage
      const stored = localStorage.getItem("planopace_victories");
      const victories = stored ? JSON.parse(stored) : [];

      // Read current user
      const userStr = localStorage.getItem("planopace_user");
      const user = userStr ? JSON.parse(userStr) : null;

      // Create new victory
      const victory = {
        id: `victory-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: user?.id || "anonymous",
        userName: user?.name || "Visitante",
        userAvatar: user?.avatar || "?",
        imageData: data.imageData,
        capturedAt: new Date().toISOString(),
        source: "filter",
      };

      victories.unshift(victory);
      localStorage.setItem("planopace_victories", JSON.stringify(victories));

      setStatus("saved");

      // Redirect to victories page
      setTimeout(() => {
        window.location.href = "/vitorias";
      }, 1500);
    } catch {
      setStatus("error");
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0B", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem", fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", animation: "spin 1s linear infinite" }}>⏳</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Salvando vitória...
            </h1>
          </>
        )}

        {status === "saved" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Vitória registrada!
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
              Redirecionando para suas vitórias...
            </p>
          </>
        )}

        {status === "empty" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📷</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Receptor de Fotos
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Tire uma foto pelo PlanoPace Filter para enviar aqui.
            </p>
            <a
              href="/vitorias"
              style={{
                background: "#F97316", color: "#fff", padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem", fontWeight: 700, textDecoration: "none",
                display: "inline-block",
              }}
            >
              Ver Minhas Vitórias
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>❌</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Erro ao salvar
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Espaço insuficiente ou erro inesperado.
            </p>
            <a
              href="/vitorias"
              style={{
                background: "#F97316", color: "#fff", padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem", fontWeight: 700, textDecoration: "none",
                display: "inline-block",
              }}
            >
              Ir para Vitórias
            </a>
          </>
        )}
      </div>
    </div>
  );
}
