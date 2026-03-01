"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RefreshCw, Check, RotateCcw, Trash2, AlertCircle } from "lucide-react";

type CameraState = "requesting" | "streaming" | "captured" | "denied";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
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

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }));
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
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

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    stopStream();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: false,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setState("streaming");
    } catch {
      setState("denied");
    }
  }, [stopStream]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      startCamera(facingMode);
    } else {
      setState("denied");
    }
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Top band
    ctx.fillStyle = "rgba(10, 10, 11, 0.75)";
    ctx.fillRect(0, 0, w, h * 0.09);

    // Orange line
    ctx.fillStyle = "#F97316";
    ctx.fillRect(0, h * 0.09 - 4, w, 4);

    // Logo
    const logoSize = Math.round(w * 0.055);
    ctx.font = `bold italic ${logoSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    const logoY = (h * 0.09) / 2;
    ctx.fillText("PLANO", w * 0.04, logoY);
    const planoW = ctx.measureText("PLANO").width;
    ctx.fillStyle = "#F97316";
    ctx.fillText("PACE", w * 0.04 + planoW, logoY);

    // Date/time top right
    const dateSize = Math.round(w * 0.032);
    ctx.font = `600 ${dateSize}px monospace`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "right";
    ctx.fillText(dateStr, w * 0.96, logoY - dateSize * 0.4);
    ctx.font = `400 ${Math.round(dateSize * 0.8)}px monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(timeStr, w * 0.96, logoY + dateSize * 0.7);

    // Corner brackets
    const margin = w * 0.06;
    const topOffset = h * 0.12;
    const bottomOffset = h * 0.78;
    const cornerLen = w * 0.08;
    ctx.strokeStyle = "#F97316";
    ctx.lineWidth = 3;

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

    // Bottom band
    ctx.fillStyle = "rgba(10, 10, 11, 0.75)";
    ctx.fillRect(0, h * 0.85, w, h * 0.15);

    // Bottom text
    const titleSize = Math.round(w * 0.045);
    ctx.font = `bold ${titleSize}px sans-serif`;
    ctx.fillStyle = "#F97316";
    ctx.textAlign = "center";
    ctx.fillText("REGISTREI MINHA VITÓRIA!", w / 2, h * 0.91);

    ctx.font = `400 ${Math.round(titleSize * 0.55)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("planopace.com", w / 2, h * 0.95);

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

    // Use video dimensions for proper aspect ratio
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    canvas.width = vw;
    canvas.height = vh;

    // Draw video frame (mirror if selfie)
    if (facingMode === "user") {
      ctx.save();
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, vw, vh);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, vw, vh);
    }

    // Draw overlay
    drawOverlay(ctx, vw, vh);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
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
                  Permita o acesso à câmera nas configurações do navegador para usar esta funcionalidade.
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
          <div className="relative flex-1 overflow-hidden">
            {/* Video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />

            {/* Live CSS overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top band */}
              <div className="absolute top-0 left-0 right-0 h-[9%] bg-[#0A0A0B]/75 flex items-center justify-between px-[4%]">
                <span className="text-[3.5vw] sm:text-lg font-bold italic tracking-tight">
                  PLANO<span className="text-orange-500">PACE</span>
                </span>
                <div className="text-right font-mono">
                  <p className="text-[2.8vw] sm:text-sm font-semibold">{currentDate}</p>
                  <p className="text-[2.2vw] sm:text-xs text-white/60">{currentTime}</p>
                </div>
              </div>
              <div className="absolute top-[9%] left-0 right-0 h-1 bg-orange-500" />

              {/* Corner brackets */}
              <div className="absolute top-[12%] left-[6%] w-[8%] aspect-square border-l-[3px] border-t-[3px] border-orange-500" />
              <div className="absolute top-[12%] right-[6%] w-[8%] aspect-square border-r-[3px] border-t-[3px] border-orange-500" />
              <div className="absolute bottom-[22%] left-[6%] w-[8%] aspect-square border-l-[3px] border-b-[3px] border-orange-500" />
              <div className="absolute bottom-[22%] right-[6%] w-[8%] aspect-square border-r-[3px] border-b-[3px] border-orange-500" />

              {/* Bottom band */}
              <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-[#0A0A0B]/75 flex flex-col items-center justify-center gap-1">
                <p className="text-orange-500 font-bold text-[4vw] sm:text-xl tracking-tight">REGISTREI MINHA VITÓRIA!</p>
                <p className="text-white/50 text-[2.5vw] sm:text-xs">planopace.com</p>
              </div>
            </div>
          </div>

          {/* Camera controls */}
          <div className="bg-black p-6 flex items-center justify-center gap-8">
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={capturePhoto}
              className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-[58px] h-[58px] rounded-full bg-white" />
            </button>
            <button
              onClick={flipCamera}
              className="p-3 rounded-full bg-white/10 text-white"
            >
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
              className="w-full h-full object-cover"
            />
          </div>

          {/* Preview controls */}
          <div className="bg-black p-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => { setCapturedImage(null); onClose(); }}
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
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
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
