"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RefreshCw, Check, RotateCcw, Trash2, AlertCircle } from "lucide-react";
import { type FilterType, FILTER_CONFIGS } from "./filters";

type CameraState = "requesting" | "streaming" | "captured" | "denied";

// Decode Google encoded polyline to lat/lng array
function decodePolyline(encoded: string): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

interface LastRunData {
  pace: string;
  distance: string;
  polyline: string | null;
}

export type { FilterType };

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  filterType?: FilterType;
}

// SVG mini map for polyline preview
function PolylineMiniMap({ polyline, accent }: { polyline: string; accent: string }) {
  const points = decodePolyline(polyline);
  if (points.length < 2) return null;

  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const pad = 0.1;
  const aMinLat = minLat - latRange * pad;
  const aMaxLat = maxLat + latRange * pad;
  const aMinLng = minLng - lngRange * pad;
  const aMaxLng = maxLng + lngRange * pad;
  const aLatRange = aMaxLat - aMinLat;
  const aLngRange = aMaxLng - aMinLng;

  const svgSize = 100;
  const pathData = points
    .map((p, i) => {
      const x = ((p[1] - aMinLng) / aLngRange) * svgSize;
      const y = (1 - (p[0] - aMinLat) / aLatRange) * svgSize;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const startX = ((points[0][1] - aMinLng) / aLngRange) * svgSize;
  const startY = (1 - (points[0][0] - aMinLat) / aLatRange) * svgSize;
  const endX = ((points[points.length - 1][1] - aMinLng) / aLngRange) * svgSize;
  const endY = (1 - (points[points.length - 1][0] - aMinLat) / aLatRange) * svgSize;

  return (
    <svg
      viewBox={`-4 -4 ${svgSize + 8} ${svgSize + 8}`}
      className="w-full mt-2"
      style={{ aspectRatio: "1", maxHeight: "25vw" }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${accent})` }}
      />
      <circle cx={startX} cy={startY} r="3" fill="#22C55E" />
      <circle cx={endX} cy={endY} r="3" fill="#EF4444" />
    </svg>
  );
}

// Component that renders the video feed to a canvas to avoid black screen issues
function LiveVideoMirror({
  videoRef,
  facingMode,
  filterType = "neon",
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  facingMode: "user" | "environment";
  filterType?: FilterType;
}) {
  const mirrorRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = mirrorRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (video.readyState >= 2) {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (canvas.width !== vw) canvas.width = vw;
        if (canvas.height !== vh) canvas.height = vh;

        ctx.save();
        if (facingMode === "user") {
          ctx.translate(vw, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, vw, vh);
        ctx.restore();
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [videoRef, facingMode]);

  const config = FILTER_CONFIGS[filterType];

  return (
    <canvas
      ref={mirrorRef}
      className="w-full h-full object-cover"
      style={{ filter: config.cssFilter }}
    />
  );
}

function getLastRunFromStrava(): LastRunData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("planopace_strava_tokens");
    if (!stored) return null;
    const cached = localStorage.getItem("planopace_last_run");
    if (cached) return JSON.parse(cached);
    return null;
  } catch {
    return null;
  }
}

// Apply pixel-level color filter based on filter type
function applyPixelFilter(data: Uint8ClampedArray, filter: FilterType) {
  switch (filter) {
    case "ice": {
      // Cool tones, desaturated, blue tint
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.2;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const sat = 0.6;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * sat));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * sat));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * sat));
        data[i] = Math.max(0, data[i] - 10);
        data[i + 1] = Math.min(255, data[i + 1] + 5);
        data[i + 2] = Math.min(255, data[i + 2] + 25);
      }
      break;
    }
    case "wanted": {
      // High contrast, desaturated, sepia tint, dark
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.4;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const sat = 0.3;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * sat));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * sat));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * sat));
        // Sepia
        const r = data[i], g = data[i + 1], b = data[i + 2];
        data[i] = Math.min(255, r * 0.9 + g * 0.15 + b * 0.05);
        data[i + 1] = Math.min(255, r * 0.1 + g * 0.7 + b * 0.05);
        data[i + 2] = Math.min(255, r * 0.05 + g * 0.1 + b * 0.6);
        // Darken
        data[i] = Math.round(data[i] * 0.8);
        data[i + 1] = Math.round(data[i + 1] * 0.8);
        data[i + 2] = Math.round(data[i + 2] * 0.8);
      }
      break;
    }
    case "zen": {
      // Soft, warm, slightly washed out, golden hour
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.05;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const sat = 0.8;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * sat));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * sat));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * sat));
        // Light sepia warmth
        data[i] = Math.min(255, data[i] + 10);
        data[i + 1] = Math.min(255, data[i + 1] + 5);
        data[i + 2] = Math.max(0, data[i + 2] - 8);
        // Brightness boost
        data[i] = Math.min(255, Math.round(data[i] * 1.15));
        data[i + 1] = Math.min(255, Math.round(data[i + 1] * 1.15));
        data[i + 2] = Math.min(255, Math.round(data[i + 2] * 1.15));
      }
      break;
    }
    case "night": {
      // Cyberpunk: high contrast, saturated, purple/green shift, dark
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.4;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const sat = 1.3;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * sat));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * sat));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * sat));
        // Purple shift + darken
        data[i] = Math.min(255, data[i] + 15);
        data[i + 1] = Math.max(0, data[i + 1] - 10);
        data[i + 2] = Math.min(255, data[i + 2] + 30);
        data[i] = Math.round(data[i] * 0.7);
        data[i + 1] = Math.round(data[i + 1] * 0.7);
        data[i + 2] = Math.round(data[i + 2] * 0.7);
      }
      break;
    }
    case "coffee": {
      // Warm coffee tones, sepia, slightly desaturated, cozy
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.15;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const sat = 0.9;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * sat));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * sat));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * sat));
        // Strong sepia
        const r = data[i], g = data[i + 1], b = data[i + 2];
        data[i] = Math.min(255, r * 0.85 + g * 0.2 + b * 0.05);
        data[i + 1] = Math.min(255, r * 0.15 + g * 0.75 + b * 0.1);
        data[i + 2] = Math.min(255, r * 0.05 + g * 0.1 + b * 0.65);
      }
      break;
    }
    case "military": {
      // Tactical: desaturated green tint, high contrast, dark
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.3;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const sat = 0.5;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * sat));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * sat));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * sat));
        // Green military tint
        data[i] = Math.max(0, data[i] - 10);
        data[i + 1] = Math.min(255, data[i + 1] + 8);
        data[i + 2] = Math.max(0, data[i + 2] - 15);
        // Darken
        data[i] = Math.round(data[i] * 0.85);
        data[i + 1] = Math.round(data[i + 1] * 0.85);
        data[i + 2] = Math.round(data[i + 2] * 0.85);
      }
      break;
    }
    default: {
      // Neon: warm tones, high saturation, dark
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.3;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const satBoost = 1.35;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * satBoost));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * satBoost));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * satBoost));
        data[i] = Math.min(255, data[i] + 8);
        data[i + 2] = Math.max(0, data[i + 2] - 5);
      }
      break;
    }
  }
}

export default function CameraCapture({ onCapture, onClose, filterType = "neon" }: CameraCaptureProps) {
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

  const config = FILTER_CONFIGS[filterType];
  const accent = config.accent;
  const phrases = config.phrases;

  // Fetch last run data from Strava
  useEffect(() => {
    const cached = getLastRunFromStrava();
    if (cached) {
      setLastRun(cached);
      return;
    }

    async function fetchLastRun() {
      try {
        const stored = localStorage.getItem("planopace_strava_tokens");
        if (!stored) return;
        const tokens = JSON.parse(stored);
        const now = Math.floor(Date.now() / 1000);

        let accessToken = tokens.accessToken;

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
            polyline: run.map?.summary_polyline || null,
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
      setState("requesting");
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = mediaStream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = mediaStream;
          await new Promise<void>((resolve) => {
            const onLoaded = () => {
              video.removeEventListener("loadedmetadata", onLoaded);
              resolve();
            };
            if (video.readyState >= 1) {
              resolve();
            } else {
              video.addEventListener("loadedmetadata", onLoaded);
            }
          });
          try {
            await video.play();
          } catch {
            // play() may reject if already playing
          }
          await new Promise<void>((resolve) => {
            if (video.readyState >= 3) {
              resolve();
            } else {
              const onPlaying = () => {
                video.removeEventListener("playing", onPlaying);
                resolve();
              };
              video.addEventListener("playing", onPlaying);
              setTimeout(resolve, 500);
            }
          });
        }
        setState("streaming");
      } catch {
        setState("denied");
      }
    },
    [stopStream]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      startCamera("user");
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

  const handleTapPhrase = () => {
    setPhraseIndex((prev) => (prev + 1) % phrases.length);
  };

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    phrase: string,
    runData: LastRunData | null,
    filter: FilterType = "neon"
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const cfg = FILTER_CONFIGS[filter];
    const accentColor = cfg.accent;

    // === DARK VIGNETTE ===
    const vignetteGrad = ctx.createRadialGradient(
      w / 2, h / 2, w * 0.2,
      w / 2, h / 2, w * 0.9
    );
    vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGrad.addColorStop(0.6, cfg.vignetteOuter.replace(/[\d.]+\)$/, "0.3)"));
    vignetteGrad.addColorStop(1, cfg.vignetteOuter);
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, w, h);

    // Color overlay blend
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = cfg.overlayTint;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    // Subtle dark overlay
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(0, 0, w, h);

    // === FILTER-SPECIFIC OVERLAY ELEMENTS ===
    if (filter === "wanted") {
      // "PROCURADO" wanted poster style
      drawWantedOverlay(ctx, w, h, accentColor);
    } else if (filter === "night") {
      // Cyberpunk scanlines + grid
      drawNightOverlay(ctx, w, h, accentColor);
    } else if (filter === "military") {
      // Military HUD elements
      drawMilitaryOverlay(ctx, w, h, accentColor);
    } else if (filter === "coffee") {
      // Coffee stamp/frame
      drawCoffeeOverlay(ctx, w, h, accentColor);
    } else if (filter === "zen") {
      // Minimal zen circles
      drawZenOverlay(ctx, w, h, accentColor);
    }

    // === TOP BAND - Logo ===
    const topH = h * 0.08;
    const topGrad = ctx.createLinearGradient(0, 0, 0, topH + 20);
    topGrad.addColorStop(0, "rgba(0, 0, 0, 0.9)");
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, topH + 20);

    // Accent line under top
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, topH - 3, w, 3);
    ctx.shadowBlur = 0;

    // Logo text
    const logoSize = Math.round(w * 0.065);
    ctx.font = `900 italic ${logoSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const logoY = topH / 2;

    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("PLANO", w / 2 - ctx.measureText("PACE").width / 2, logoY);
    const planoW = ctx.measureText("PLANO").width;
    ctx.fillStyle = accentColor;
    ctx.fillText("PACE", w / 2 + planoW / 2, logoY);
    ctx.shadowBlur = 0;

    // Date/time
    const smallSize = Math.round(w * 0.025);
    ctx.font = `500 ${smallSize}px monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.fillText(`${dateStr}  •  ${timeStr}`, w / 2, topH + 14);

    // === CORNER BRACKETS ===
    const margin = w * 0.05;
    const topOffset = h * 0.13;
    const bottomOffset = h * 0.72;
    const cornerLen = w * 0.1;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(margin, topOffset + cornerLen);
    ctx.lineTo(margin, topOffset);
    ctx.lineTo(margin + cornerLen, topOffset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - margin - cornerLen, topOffset);
    ctx.lineTo(w - margin, topOffset);
    ctx.lineTo(w - margin, topOffset + cornerLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(margin, bottomOffset - cornerLen);
    ctx.lineTo(margin, bottomOffset);
    ctx.lineTo(margin + cornerLen, bottomOffset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - margin - cornerLen, bottomOffset);
    ctx.lineTo(w - margin, bottomOffset);
    ctx.lineTo(w - margin, bottomOffset - cornerLen);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // === LAST RUN DATA ===
    if (runData) {
      const labelSize = Math.round(w * 0.025);
      const valueSize = Math.round(w * 0.042);
      const hasMap = !!runData.polyline;
      const pillW = w * 0.32;
      const dataSectionH = h * 0.08;
      const mapSectionH = hasMap ? w * 0.28 : 0;
      const pillH = dataSectionH + mapSectionH + (hasMap ? 14 : 0);
      const pillX = w * 0.95 - pillW;
      const pillY = h * 0.44;

      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
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

      ctx.fillStyle = accentColor;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 8;
      ctx.fillRect(pillX, pillY + 6, 3, pillH - 12);
      ctx.shadowBlur = 0;

      const headerSize = Math.round(w * 0.02);
      ctx.font = `700 ${headerSize}px sans-serif`;
      ctx.fillStyle = accentColor;
      ctx.textAlign = "left";
      ctx.fillText("ÚLTIMA CORRIDA", pillX + 14, pillY + 18);

      ctx.font = `600 ${labelSize}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("PACE", pillX + 14, pillY + dataSectionH * 0.48);
      ctx.font = `800 ${valueSize}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(runData.pace, pillX + 14, pillY + dataSectionH * 0.48 + valueSize + 2);

      const distX = pillX + pillW * 0.55;
      ctx.font = `600 ${labelSize}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("DIST", distX, pillY + dataSectionH * 0.48);
      ctx.font = `800 ${valueSize}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(runData.distance, distX, pillY + dataSectionH * 0.48 + valueSize + 2);

      if (hasMap && runData.polyline) {
        const points = decodePolyline(runData.polyline);
        if (points.length > 1) {
          const mapPad = 10;
          const mapX = pillX + mapPad;
          const mapY = pillY + dataSectionH + 6;
          const mapW = pillW - mapPad * 2;
          const mapH = mapSectionH - 6;

          let minLat = Infinity, maxLat = -Infinity;
          let minLng = Infinity, maxLng = -Infinity;
          for (const [lat, lng] of points) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
          }

          const latRange = maxLat - minLat || 0.001;
          const lngRange = maxLng - minLng || 0.001;
          const pad = 0.1;
          const adjMinLat = minLat - latRange * pad;
          const adjMaxLat = maxLat + latRange * pad;
          const adjMinLng = minLng - lngRange * pad;
          const adjMaxLng = maxLng + lngRange * pad;
          const adjLatRange = adjMaxLat - adjMinLat;
          const adjLngRange = adjMaxLng - adjMinLng;

          ctx.beginPath();
          for (let i = 0; i < points.length; i++) {
            const px = mapX + ((points[i][1] - adjMinLng) / adjLngRange) * mapW;
            const py = mapY + (1 - (points[i][0] - adjMinLat) / adjLatRange) * mapH;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;

          const startPx = mapX + ((points[0][1] - adjMinLng) / adjLngRange) * mapW;
          const startPy = mapY + (1 - (points[0][0] - adjMinLat) / adjLatRange) * mapH;
          ctx.beginPath();
          ctx.arc(startPx, startPy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#22C55E";
          ctx.fill();

          const endIdx = points.length - 1;
          const endPx = mapX + ((points[endIdx][1] - adjMinLng) / adjLngRange) * mapW;
          const endPy = mapY + (1 - (points[endIdx][0] - adjMinLat) / adjLatRange) * mapH;
          ctx.beginPath();
          ctx.arc(endPx, endPy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#EF4444";
          ctx.fill();
        }
      }
    }

    // === BOTTOM BAND ===
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
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 6;

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

    // "REGISTREI MINHA VITÓRIA!"
    const titleSize = Math.round(w * 0.05);
    ctx.font = `900 ${titleSize}px sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 15;
    ctx.textAlign = "center";
    ctx.fillText("REGISTREI MINHA VITÓRIA!", w / 2, h - bottomH * 0.22);
    ctx.shadowBlur = 0;

    // planopace.vercel.app
    ctx.font = `500 ${Math.round(w * 0.028)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("planopace.vercel.app", w / 2, h - bottomH * 0.06);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  };

  // === FILTER-SPECIFIC OVERLAY DRAWERS ===

  function drawWantedOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string) {
    // "PROCURADO" text at top of photo area
    const fontSize = Math.round(w * 0.12);
    ctx.save();
    ctx.font = `900 ${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.fillText("PROCURADO", w / 2, h * 0.38);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Torn paper edges (top and bottom rough lines)
    ctx.save();
    ctx.strokeStyle = "rgba(180,50,20,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x += 8) {
      const y = h * 0.12 + Math.sin(x * 0.05) * 4 + Math.random() * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let x = 0; x < w; x += 8) {
      const y = h * 0.73 + Math.sin(x * 0.07) * 4 + Math.random() * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawNightOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string) {
    // Horizontal scanlines
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = accentColor;
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Perspective grid at bottom
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 1;
    const gridY = h * 0.65;
    for (let i = 0; i < 8; i++) {
      const y = gridY + i * (h * 0.04);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const x = w * 0.1 + i * (w * 0.08);
      ctx.beginPath();
      ctx.moveTo(w / 2, gridY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawMilitaryOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string) {
    // Crosshair in center
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    const cx = w / 2;
    const cy = h * 0.42;
    const cr = w * 0.08;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - cr * 1.3, cy);
    ctx.lineTo(cx - cr * 0.4, cy);
    ctx.moveTo(cx + cr * 0.4, cy);
    ctx.lineTo(cx + cr * 1.3, cy);
    ctx.moveTo(cx, cy - cr * 1.3);
    ctx.lineTo(cx, cy - cr * 0.4);
    ctx.moveTo(cx, cy + cr * 0.4);
    ctx.lineTo(cx, cy + cr * 1.3);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Coordinate markers
    ctx.save();
    const coordSize = Math.round(w * 0.02);
    ctx.font = `600 ${coordSize}px monospace`;
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.25;
    ctx.textAlign = "left";
    ctx.fillText("LAT -23.5505", w * 0.05, h * 0.1);
    ctx.fillText("LNG -46.6333", w * 0.05, h * 0.1 + coordSize + 4);
    ctx.textAlign = "right";
    ctx.fillText("STATUS: ATIVO", w * 0.95, h * 0.1);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCoffeeOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string) {
    // Coffee ring stain (circle)
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(w * 0.15, h * 0.2, w * 0.08, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Kraft paper grain - subtle dots
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = accentColor;
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawZenOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string) {
    // Zen circle (enso)
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.42, w * 0.15, -Math.PI * 0.1, Math.PI * 1.7);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Thin horizontal line decorations
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.15);
    ctx.lineTo(w * 0.4, h * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.6, h * 0.15);
    ctx.lineTo(w * 0.9, h * 0.15);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    await document.fonts.ready;

    const targetW = 1080;
    const targetH = 1920;
    canvas.width = targetW;
    canvas.height = targetH;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, targetW, targetH);

    const videoRatio = vw / vh;
    const targetRatio = targetW / targetH;

    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (videoRatio > targetRatio) {
      drawW = targetW;
      drawH = targetW / videoRatio;
      drawX = 0;
      drawY = (targetH - drawH) / 2;
    } else {
      drawH = targetH;
      drawW = targetH * videoRatio;
      drawX = (targetW - drawW) / 2;
      drawY = 0;
    }

    if (facingMode === "user") {
      ctx.save();
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, vw, vh, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, vw, vh, drawX, drawY, drawW, drawH);
    }

    // Apply pixel filter
    const imageData = ctx.getImageData(0, 0, targetW, targetH);
    applyPixelFilter(imageData.data, filterType);
    ctx.putImageData(imageData, 0, 0);

    // Draw overlay
    drawOverlay(ctx, targetW, targetH, phrases[phraseIndex], lastRun, filterType);

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

  const accentGlow = `${config.accentGlow}0.4)`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
    >
      {/* Hidden video element always in DOM */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Permission denied */}
      {state === "denied" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
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
          </div>
        </div>
      )}

      {/* Loading */}
      {state === "requesting" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" style={{ color: accent }} />
            <h2 className="text-xl font-bold text-white mb-2">Acessando câmera...</h2>
            <p className="text-gray-400 text-sm">Permita o acesso à câmera quando solicitado</p>
          </div>
        </div>
      )}

      {/* Live camera */}
      {state === "streaming" && (
        <>
          <div
            className="relative flex-1 overflow-hidden"
            onClick={handleTapPhrase}
          >
            <LiveVideoMirror
              videoRef={videoRef}
              facingMode={facingMode}
              filterType={filterType}
            />

            {/* Live CSS overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vignette */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at center, transparent 20%, ${config.vignetteOuter.replace(/[\d.]+\)$/, "0.3)")} 60%, ${config.vignetteOuter} 100%)`,
                }}
              />

              {/* Filter-specific live overlays */}
              {filterType === "night" && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, ${accent}08 0px, transparent 1px, transparent 4px)`,
                  }}
                />
              )}
              {filterType === "wanted" && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ pointerEvents: "none" }}
                >
                  <span
                    className="text-[15vw] font-black opacity-[0.06] tracking-widest"
                    style={{ fontFamily: "serif", color: accent }}
                  >
                    PROCURADO
                  </span>
                </div>
              )}
              {filterType === "zen" && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
                  <div
                    className="rounded-full border-[3px] opacity-[0.08]"
                    style={{ width: "30vw", height: "30vw", borderColor: accent }}
                  />
                </div>
              )}
              {filterType === "military" && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
                  <div className="relative opacity-[0.12]" style={{ width: "16vw", height: "16vw" }}>
                    <div className="absolute rounded-full border-[2px]" style={{ inset: 0, borderColor: accent }} />
                    <div className="absolute top-1/2 left-0 right-0 h-[1px]" style={{ backgroundColor: accent }} />
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px]" style={{ backgroundColor: accent }} />
                  </div>
                </div>
              )}

              {/* Top band */}
              <div
                className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center pt-3 pb-6"
                style={{
                  height: "10%",
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
                }}
              >
                <span
                  className="text-[5vw] sm:text-2xl font-black italic tracking-tight"
                  style={{ textShadow: `0 0 20px ${accent}` }}
                >
                  PLANO<span style={{ color: accent }}>PACE</span>
                </span>
                <span className="text-[2.2vw] sm:text-xs text-white/50 font-mono mt-0.5">
                  {currentDate} &bull; {currentTime}
                </span>
              </div>

              {/* Accent glow line */}
              <div
                className="absolute left-0 right-0 h-[3px]"
                style={{
                  top: "8.5%",
                  backgroundColor: accent,
                  boxShadow: `0 0 15px ${accent}, 0 0 30px ${accent}`,
                }}
              />

              {/* Corner brackets */}
              {[
                { pos: "top-[12%] left-[5%]", border: "border-l-[3px] border-t-[3px]", shadow: "inset 8px 8px 15px -10px" },
                { pos: "top-[12%] right-[5%]", border: "border-r-[3px] border-t-[3px]", shadow: "inset -8px 8px 15px -10px" },
                { pos: "bottom-[28%] left-[5%]", border: "border-l-[3px] border-b-[3px]", shadow: "inset 8px -8px 15px -10px" },
                { pos: "bottom-[28%] right-[5%]", border: "border-r-[3px] border-b-[3px]", shadow: "inset -8px -8px 15px -10px" },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`absolute ${c.pos} w-[10%] aspect-square ${c.border}`}
                  style={{
                    borderColor: accent,
                    boxShadow: `${c.shadow} ${accent}`,
                  }}
                />
              ))}

              {/* Last run data */}
              {lastRun && (
                <div
                  className="absolute right-[3%] flex flex-col items-end"
                  style={{ top: "42%" }}
                >
                  <div
                    className="bg-black/65 backdrop-blur-sm rounded-xl px-3 py-2.5 border-l-[3px]"
                    style={{
                      borderColor: accent,
                      boxShadow: `0 0 10px ${config.accentGlow}0.2)`,
                    }}
                  >
                    <p
                      className="text-[2vw] sm:text-[10px] font-bold tracking-wider mb-1.5"
                      style={{ color: accent }}
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
                    {lastRun.polyline && (
                      <PolylineMiniMap polyline={lastRun.polyline} accent={accent} />
                    )}
                  </div>
                </div>
              )}

              {/* Bottom band */}
              <div
                className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 pt-10"
                style={{
                  height: "22%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7) 60%, transparent)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-[3.5vw] sm:text-base font-extrabold italic text-white text-center px-6 mb-3 leading-tight"
                    style={{ textShadow: `0 0 8px ${config.accentGlow}0.4)` }}
                  >
                    {phrases[phraseIndex]}
                  </motion.p>
                </AnimatePresence>

                <p
                  className="text-[4.5vw] sm:text-xl font-black tracking-tight mb-1"
                  style={{
                    color: accent,
                    textShadow: `0 0 20px ${accent}`,
                  }}
                >
                  REGISTREI MINHA VITÓRIA!
                </p>
                <p className="text-white/40 text-[2.3vw] sm:text-xs font-medium">
                  planopace.vercel.app
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
              className="w-[72px] h-[72px] rounded-full border-4 flex items-center justify-center active:scale-95 transition-transform"
              style={{
                borderColor: accent,
                boxShadow: `0 0 20px ${accentGlow}`,
              }}
            >
              <div className="w-[58px] h-[58px] rounded-full" style={{ backgroundColor: accent }} />
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
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-colors"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 15px ${accentGlow}`,
                }}
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
