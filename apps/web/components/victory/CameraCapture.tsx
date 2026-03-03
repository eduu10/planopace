"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RefreshCw, Check, RotateCcw, Trash2, AlertCircle } from "lucide-react";

type CameraState = "requesting" | "streaming" | "captured" | "denied";

interface LastRunData {
  pace: string;
  distance: string;
}

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const PHRASES = [
  "Corro porque a pizza não vai se queimar sozinha 🍕",
  "Meu pace é lento, mas meu coração é de maratonista 💀",
  "Acordo cedo pra correr. Mentira, acordo cedo e sofro correndo 😭",
  "Se correr o bicho pega, se ficar o shape não vem 🏃‍♂️",
  "Treino pesado, cerveja gelada. Equilíbrio é tudo 🍺",
  "Eu não corro da responsabilidade, eu corro na rua mesmo 🛣️",
  "Deus me livre, mas quem me dera um sub-4 🙏",
  "Sofri, chorei, mas o Strava registrou ✅",
  "Não é sobre velocidade, é sobre não parar no meio 🐢",
  "Hoje o treino foi tão bom que quase desisti 3 vezes 😅",
];

function getLastRunFromStrava(): LastRunData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("planopace_strava_tokens");
    if (!stored) return null;
    // Try cached activities
    const cached = localStorage.getItem("planopace_last_run");
    if (cached) return JSON.parse(cached);
    return null;
  } catch {
    return null;
  }
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("requesting");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [lastRun, setLastRun] = useState<LastRunData | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Fetch last run data from Strava
  useEffect(() => {
    const cached = getLastRunFromStrava();
    if (cached) {
      setLastRun(cached);
      return;
    }

    // Try fetching from API
    async function fetchLastRun() {
      try {
        const stored = localStorage.getItem("planopace_strava_tokens");
        if (!stored) return;
        const tokens = JSON.parse(stored);
        const now = Math.floor(Date.now() / 1000);

        let accessToken = tokens.accessToken;

        // Refresh token if expired
        if (tokens.expiresAt <= now + 300) {
          const refreshRes = await fetch("/api/strava/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });
          if (!refreshRes.ok) return;
          const refreshData = await refreshRes.json();
          accessToken = refreshData.accessToken;
          const updated = {
            ...tokens,
            accessToken: refreshData.accessToken,
            refreshToken: refreshData.refreshToken,
            expiresAt: refreshData.expiresAt,
          };
          localStorage.setItem("planopace_strava_tokens", JSON.stringify(updated));
        }

        const res = await fetch("/api/strava/activities?per_page=10", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const activities = await res.json();
        const run = activities.find(
          (a: { type: string; sport_type: string }) =>
            a.type === "Run" || a.sport_type === "Run" || a.type === "VirtualRun"
        );
        if (run) {
          const paceMinPerKm =
            run.distance > 0 ? run.moving_time / 60 / (run.distance / 1000) : 0;
          const mins = Math.floor(paceMinPerKm);
          const secs = Math.round((paceMinPerKm - mins) * 60);
          const data: LastRunData = {
            pace: `${mins}:${secs.toString().padStart(2, "0")}/km`,
            distance: `${(run.distance / 1000).toFixed(1)}km`,
          };
          setLastRun(data);
          localStorage.setItem("planopace_last_run", JSON.stringify(data));
        }
      } catch {
        // Silently fail
      }
    }
    fetchLastRun();
  }, []);

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
      );
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (facing: "user" | "environment") => {
      stopStream();
      setVideoReady(false);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1080 },
            height: { ideal: 1920 },
          },
          audio: false,
        });
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video plays after setting srcObject
          try {
            await videoRef.current.play();
          } catch {
            // play() may reject if already playing, that's fine
          }
        }
        setState("streaming");
      } catch {
        setState("denied");
      }
    },
    [stopStream]
  );

  // Start camera immediately with front-facing (selfie)
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      startCamera("user");
    } else {
      setState("denied");
    }
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVideoPlaying = () => {
    setVideoReady(true);
  };

  const flipCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const handleTapPhrase = () => {
    setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
  };

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    phrase: string,
    runData: LastRunData | null
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // === RADICAL DARK FILTER ===
    // Dark vignette overlay
    const vignetteGrad = ctx.createRadialGradient(
      w / 2, h / 2, w * 0.2,
      w / 2, h / 2, w * 0.9
    );
    vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGrad.addColorStop(0.6, "rgba(0,0,0,0.3)");
    vignetteGrad.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, w, h);

    // Boost contrast/saturation via color overlay blend
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(255, 100, 0, 0.08)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    // Subtle grain texture effect via noise overlay
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(0, 0, w, h);

    // === TOP BAND - Logo ===
    const topH = h * 0.08;
    const topGrad = ctx.createLinearGradient(0, 0, 0, topH + 20);
    topGrad.addColorStop(0, "rgba(0, 0, 0, 0.9)");
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, topH + 20);

    // Neon orange glow line under top
    ctx.shadowColor = "#FF6B00";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#FF6B00";
    ctx.fillRect(0, topH - 3, w, 3);
    ctx.shadowBlur = 0;

    // Logo text
    const logoSize = Math.round(w * 0.065);
    ctx.font = `900 italic ${logoSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const logoY = topH / 2;

    // Neon glow on logo
    ctx.shadowColor = "#FF6B00";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("PLANO", w / 2 - ctx.measureText("PACE").width / 2, logoY);
    const planoW = ctx.measureText("PLANO").width;
    ctx.fillStyle = "#FF6B00";
    ctx.fillText("PACE", w / 2 + planoW / 2, logoY);
    ctx.shadowBlur = 0;

    // Small date/time under logo
    const smallSize = Math.round(w * 0.025);
    ctx.font = `500 ${smallSize}px monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.fillText(`${dateStr}  •  ${timeStr}`, w / 2, topH + 14);

    // === CORNER NEON BRACKETS ===
    const margin = w * 0.05;
    const topOffset = h * 0.13;
    const bottomOffset = h * 0.72;
    const cornerLen = w * 0.1;
    ctx.strokeStyle = "#FF6B00";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#FF6B00";
    ctx.shadowBlur = 10;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(margin, topOffset + cornerLen);
    ctx.lineTo(margin, topOffset);
    ctx.lineTo(margin + cornerLen, topOffset);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - margin - cornerLen, topOffset);
    ctx.lineTo(w - margin, topOffset);
    ctx.lineTo(w - margin, topOffset + cornerLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(margin, bottomOffset - cornerLen);
    ctx.lineTo(margin, bottomOffset);
    ctx.lineTo(margin + cornerLen, bottomOffset);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - margin - cornerLen, bottomOffset);
    ctx.lineTo(w - margin, bottomOffset);
    ctx.lineTo(w - margin, bottomOffset - cornerLen);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // === LAST RUN DATA - Right side middle ===
    if (runData) {
      const dataX = w * 0.95;
      const dataY = h * 0.48;
      const labelSize = Math.round(w * 0.025);
      const valueSize = Math.round(w * 0.042);

      // Semi-transparent dark background pill
      const pillW = w * 0.3;
      const pillH = h * 0.1;
      const pillX = dataX - pillW;
      const pillY = dataY - pillH * 0.3;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      const radius = 12;
      ctx.moveTo(pillX + radius, pillY);
      ctx.lineTo(pillX + pillW - radius, pillY);
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + radius);
      ctx.lineTo(pillX + pillW, pillY + pillH - radius);
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - radius, pillY + pillH);
      ctx.lineTo(pillX + radius, pillY + pillH);
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - radius);
      ctx.lineTo(pillX, pillY + radius);
      ctx.quadraticCurveTo(pillX, pillY, pillX + radius, pillY);
      ctx.closePath();
      ctx.fill();

      // Left neon accent bar
      ctx.fillStyle = "#FF6B00";
      ctx.shadowColor = "#FF6B00";
      ctx.shadowBlur = 8;
      ctx.fillRect(pillX, pillY + 6, 3, pillH - 12);
      ctx.shadowBlur = 0;

      // "ÚLTIMA CORRIDA" header
      const headerSize = Math.round(w * 0.02);
      ctx.font = `700 ${headerSize}px sans-serif`;
      ctx.fillStyle = "#FF6B00";
      ctx.textAlign = "left";
      ctx.fillText("ÚLTIMA CORRIDA", pillX + 14, pillY + 18);

      // Pace
      ctx.font = `600 ${labelSize}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("PACE", pillX + 14, pillY + pillH * 0.48);
      ctx.font = `800 ${valueSize}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(runData.pace, pillX + 14, pillY + pillH * 0.48 + valueSize + 2);

      // Distance
      const distX = pillX + pillW * 0.55;
      ctx.font = `600 ${labelSize}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("DIST", distX, pillY + pillH * 0.48);
      ctx.font = `800 ${valueSize}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(runData.distance, distX, pillY + pillH * 0.48 + valueSize + 2);
    }

    // === BOTTOM BAND - Phrase ===
    const bottomH = h * 0.2;
    const bottomY = h - bottomH;
    const bottomGrad = ctx.createLinearGradient(0, bottomY - 30, 0, h);
    bottomGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomGrad.addColorStop(0.15, "rgba(0, 0, 0, 0.7)");
    bottomGrad.addColorStop(1, "rgba(0, 0, 0, 0.95)");
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, bottomY - 30, w, bottomH + 30);

    // Motivational phrase
    const phraseSize = Math.round(w * 0.042);
    ctx.font = `800 italic ${phraseSize}px sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.shadowColor = "#FF6B00";
    ctx.shadowBlur = 6;

    // Word wrap the phrase
    const maxLineW = w * 0.85;
    const words = phrase.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxLineW && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = phraseSize * 1.3;
    const phraseStartY = bottomY + 20 + (bottomH * 0.3 - (lines.length * lineHeight) / 2);
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], w / 2, phraseStartY + i * lineHeight);
    }
    ctx.shadowBlur = 0;

    // "REGISTREI MINHA VITÓRIA!" with neon glow
    const titleSize = Math.round(w * 0.05);
    ctx.font = `900 ${titleSize}px sans-serif`;
    ctx.fillStyle = "#FF6B00";
    ctx.shadowColor = "#FF6B00";
    ctx.shadowBlur = 15;
    ctx.textAlign = "center";
    ctx.fillText("REGISTREI MINHA VITÓRIA!", w / 2, h - bottomH * 0.22);
    ctx.shadowBlur = 0;

    // planopace.com
    ctx.font = `500 ${Math.round(w * 0.028)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("planopace.com", w / 2, h - bottomH * 0.06);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    await document.fonts.ready;

    // Force 9:16 story format (1080x1920)
    const targetW = 1080;
    const targetH = 1920;
    canvas.width = targetW;
    canvas.height = targetH;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Calculate crop to fit 9:16 with less zoom (show more of the scene)
    const targetRatio = targetW / targetH; // 0.5625
    const videoRatio = vw / vh;

    let sx: number, sy: number, sw: number, sh: number;

    if (videoRatio > targetRatio) {
      // Video is wider - crop sides
      sh = vh;
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      // Video is taller - crop top/bottom
      sw = vw;
      sh = vw / targetRatio;
      sx = 0;
      sy = (vh - sh) / 2;
    }

    // Draw video frame (mirror if selfie)
    if (facingMode === "user") {
      ctx.save();
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
      ctx.restore();
    } else {
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
    }

    // Apply radical color filter on canvas pixels
    const imageData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Increase contrast
      const factor = 1.3;
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));       // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B

      // Boost saturation - shift towards vivid
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const satBoost = 1.35;
      data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * satBoost));
      data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * satBoost));
      data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * satBoost));

      // Slight warm tint
      data[i] = Math.min(255, data[i] + 8);       // R boost
      data[i + 2] = Math.max(0, data[i + 2] - 5); // B reduce
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw overlay
    drawOverlay(ctx, targetW, targetH, PHRASES[phraseIndex], lastRun);

    const imgData = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(imgData);
    setState("captured");
  };

  const retake = () => {
    setCapturedImage(null);
    setState("streaming");
    startCamera(facingMode);
  };

  const save = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
    >
      {/* Permission request / denied */}
      {(state === "requesting" || state === "denied") && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            {state === "requesting" ? (
              <>
                <Camera className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Acessando câmera...</h2>
                <p className="text-gray-400 text-sm">Permita o acesso à câmera quando solicitado</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Câmera bloqueada</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Permita o acesso à câmera nas configurações do navegador para usar esta
                  funcionalidade.
                </p>
                <button
                  onClick={onClose}
                  className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live camera */}
      {state === "streaming" && (
        <>
          {/* Tap area for phrase change */}
          <div
            className="relative flex-1 overflow-hidden"
            onClick={handleTapPhrase}
          >
            {/* Video feed - radical filter applied via CSS */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onPlaying={handleVideoPlaying}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                videoReady ? "opacity-100" : "opacity-0"
              } ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              style={{
                filter: "contrast(1.3) saturate(1.4) brightness(0.85)",
              }}
            />

            {/* Loading spinner while video initializes */}
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Camera className="w-10 h-10 text-orange-500 animate-pulse" />
              </div>
            )}

            {/* Live CSS overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Dark vignette via CSS */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)",
                }}
              />

              {/* Top band with gradient fade */}
              <div
                className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center pt-3 pb-6"
                style={{
                  height: "10%",
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
                }}
              >
                <span
                  className="text-[5vw] sm:text-2xl font-black italic tracking-tight"
                  style={{ textShadow: "0 0 20px #FF6B00" }}
                >
                  PLANO<span className="text-[#FF6B00]">PACE</span>
                </span>
                <span className="text-[2.2vw] sm:text-xs text-white/50 font-mono mt-0.5">
                  {currentDate} &bull; {currentTime}
                </span>
              </div>

              {/* Neon glow line */}
              <div
                className="absolute left-0 right-0 h-[3px] bg-[#FF6B00]"
                style={{ top: "8.5%", boxShadow: "0 0 15px #FF6B00, 0 0 30px #FF6B00" }}
              />

              {/* Corner neon brackets */}
              <div
                className="absolute top-[12%] left-[5%] w-[10%] aspect-square border-l-[3px] border-t-[3px] border-[#FF6B00]"
                style={{ boxShadow: "inset 8px 8px 15px -10px #FF6B00" }}
              />
              <div
                className="absolute top-[12%] right-[5%] w-[10%] aspect-square border-r-[3px] border-t-[3px] border-[#FF6B00]"
                style={{ boxShadow: "inset -8px 8px 15px -10px #FF6B00" }}
              />
              <div
                className="absolute bottom-[28%] left-[5%] w-[10%] aspect-square border-l-[3px] border-b-[3px] border-[#FF6B00]"
                style={{ boxShadow: "inset 8px -8px 15px -10px #FF6B00" }}
              />
              <div
                className="absolute bottom-[28%] right-[5%] w-[10%] aspect-square border-r-[3px] border-b-[3px] border-[#FF6B00]"
                style={{ boxShadow: "inset -8px -8px 15px -10px #FF6B00" }}
              />

              {/* Last run data - right side middle */}
              {lastRun && (
                <div
                  className="absolute right-[3%] flex flex-col items-end"
                  style={{ top: "45%" }}
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2.5 border-l-[3px] border-[#FF6B00]"
                    style={{ boxShadow: "0 0 10px rgba(255,107,0,0.2)" }}
                  >
                    <p
                      className="text-[2vw] sm:text-[10px] font-bold text-[#FF6B00] tracking-wider mb-1.5"
                    >
                      ÚLTIMA CORRIDA
                    </p>
                    <div className="flex gap-3">
                      <div>
                        <p className="text-[1.8vw] sm:text-[8px] text-white/50 font-semibold">PACE</p>
                        <p className="text-[3.2vw] sm:text-sm font-extrabold text-white">{lastRun.pace}</p>
                      </div>
                      <div>
                        <p className="text-[1.8vw] sm:text-[8px] text-white/50 font-semibold">DIST</p>
                        <p className="text-[3.2vw] sm:text-sm font-extrabold text-white">{lastRun.distance}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom band with phrase */}
              <div
                className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 pt-10"
                style={{
                  height: "22%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7) 60%, transparent)",
                }}
              >
                {/* Motivational phrase */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-[3.5vw] sm:text-base font-extrabold italic text-white text-center px-6 mb-3 leading-tight"
                    style={{ textShadow: "0 0 8px rgba(255,107,0,0.4)" }}
                  >
                    {PHRASES[phraseIndex]}
                  </motion.p>
                </AnimatePresence>

                {/* Title */}
                <p
                  className="text-[4.5vw] sm:text-xl font-black text-[#FF6B00] tracking-tight mb-1"
                  style={{ textShadow: "0 0 20px #FF6B00" }}
                >
                  REGISTREI MINHA VITÓRIA!
                </p>
                <p className="text-white/40 text-[2.3vw] sm:text-xs font-medium">
                  planopace.com
                </p>
              </div>

              {/* Tap hint */}
              <div className="absolute bottom-[23%] left-0 right-0 flex justify-center">
                <span className="text-[2vw] sm:text-[10px] text-white/30 font-medium">
                  toque para mudar a frase
                </span>
              </div>
            </div>
          </div>

          {/* Camera controls */}
          <div className="bg-black p-6 flex items-center justify-center gap-8">
            <button onClick={onClose} className="p-3 rounded-full bg-white/10 text-white">
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={capturePhoto}
              className="w-[72px] h-[72px] rounded-full border-4 border-[#FF6B00] flex items-center justify-center active:scale-95 transition-transform"
              style={{ boxShadow: "0 0 20px rgba(255,107,0,0.4)" }}
            >
              <div className="w-[58px] h-[58px] rounded-full bg-[#FF6B00]" />
            </button>
            <button onClick={flipCamera} className="p-3 rounded-full bg-white/10 text-white">
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </>
      )}

      {/* Preview captured photo */}
      {state === "captured" && capturedImage && (
        <>
          <div className="relative flex-1 overflow-hidden">
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-full h-full object-contain bg-black"
            />
          </div>

          {/* Preview controls */}
          <div className="bg-black p-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setCapturedImage(null);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Descartar
              </button>
              <button
                onClick={retake}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Tirar outra
              </button>
              <button
                onClick={save}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-sm font-bold transition-colors"
                style={{ boxShadow: "0 0 15px rgba(255,107,0,0.4)" }}
              >
                <Check className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
