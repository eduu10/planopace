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
    case "landscape": {
      // Landscape: minimal manipulation, slight contrast + saturation boost
      for (let i = 0; i < data.length; i += 4) {
        const factor = 1.05;
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const sat = 1.1;
        data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * sat));
        data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * sat));
        data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * sat));
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

  // Helper: draw polyline route on canvas
  function drawRouteMap(
    ctx: CanvasRenderingContext2D,
    polyline: string,
    mapX: number, mapY: number, mapW: number, mapH: number,
    strokeColor: string, glowColor: string
  ) {
    const points = decodePolyline(polyline);
    if (points.length < 2) return;

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
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = glowColor;
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

  // Helper: word wrap text and draw centered
  function drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number, startY: number,
    maxWidth: number, lineHeight: number
  ) {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, startY + i * lineHeight);
    }
    return lines.length;
  }

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    phrase: string,
    runData: LastRunData | null,
    filter: FilterType = "neon"
  ) => {
    // Filters with completely custom layouts
    if (filter === "night") {
      drawNightFullOverlay(ctx, w, h, phrase, runData);
      return;
    }
    if (filter === "coffee") {
      drawCoffeeFullOverlay(ctx, w, h, phrase, runData);
      return;
    }
    if (filter === "military") {
      drawMilitaryFullOverlay(ctx, w, h, phrase, runData);
      return;
    }
    if (filter === "landscape") {
      drawLandscapeFullOverlay(ctx, w, h, runData);
      return;
    }

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

    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = cfg.overlayTint;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(0, 0, w, h);

    // === FILTER-SPECIFIC ADDITIONS ===
    if (filter === "wanted") {
      drawWantedOverlay(ctx, w, h, accentColor);
    } else if (filter === "zen") {
      drawZenOverlay(ctx, w, h, accentColor);
    }

    // === TOP BAND - Logo ===
    const topH = h * 0.08;
    const topGrad = ctx.createLinearGradient(0, 0, 0, topH + 20);
    topGrad.addColorStop(0, "rgba(0, 0, 0, 0.9)");
    topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, topH + 20);

    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, topH - 3, w, 3);
    ctx.shadowBlur = 0;

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
        drawRouteMap(ctx, runData.polyline, pillX + 10, pillY + dataSectionH + 6, pillW - 20, mapSectionH - 6, accentColor, accentColor);
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

    const phraseSize = Math.round(w * 0.042);
    ctx.font = `800 italic ${phraseSize}px sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 6;

    const lineHeight = phraseSize * 1.3;
    const phraseStartY = bottomY + 20 + (bottomH * 0.3 - lineHeight);
    drawWrappedText(ctx, phrase, w / 2, phraseStartY, w * 0.85, lineHeight);
    ctx.shadowBlur = 0;

    const titleSize = Math.round(w * 0.05);
    ctx.font = `900 ${titleSize}px sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 15;
    ctx.textAlign = "center";
    ctx.fillText("REGISTREI MINHA VITÓRIA!", w / 2, h - bottomH * 0.22);
    ctx.shadowBlur = 0;

    ctx.font = `500 ${Math.round(w * 0.028)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("planopace.vercel.app", w / 2, h - bottomH * 0.06);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  };

  // === SHARED SMALL OVERLAY ADDITIONS ===

  function drawWantedOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string) {
    const fontSize = Math.round(w * 0.12);
    ctx.save();
    ctx.font = `900 ${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.15;
    ctx.fillText("PROCURADO", w / 2, h * 0.38);
    ctx.globalAlpha = 1;
    ctx.restore();

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

  function drawZenOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string) {
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

  // ========================================
  // NIGHT — Fullscreen cyberpunk HUD
  // ========================================
  function drawNightFullOverlay(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    phrase: string, runData: LastRunData | null
  ) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const cyan = "#00FFCC";
    const magenta = "#FF00FF";

    // Scanlines over entire image
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = cyan;
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Subtle dark vignette (no frame)
    const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.9);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(5,0,30,0.6)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Purple/cyan overlay tint
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(100, 0, 255, 0.08)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    // Top-left: PLANOPACE logo with neon cyan glow
    const logoSize = Math.round(w * 0.055);
    ctx.font = `900 italic ${logoSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowColor = cyan;
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("PLANO", w * 0.04, h * 0.03);
    const planoW = ctx.measureText("PLANO").width;
    ctx.fillStyle = cyan;
    ctx.fillText("PACE", w * 0.04 + planoW, h * 0.03);
    ctx.shadowBlur = 0;

    // Top-right: date/time in green terminal font
    const termSize = Math.round(w * 0.025);
    ctx.font = `600 ${termSize}px monospace`;
    ctx.fillStyle = "#00FF41";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.shadowColor = "#00FF41";
    ctx.shadowBlur = 4;
    ctx.fillText(dateStr, w * 0.96, h * 0.03);
    ctx.fillText(timeStr, w * 0.96, h * 0.03 + termSize + 4);
    ctx.shadowBlur = 0;

    // HUD corner elements
    const hudSize = Math.round(w * 0.018);
    ctx.font = `500 ${hudSize}px monospace`;
    ctx.fillStyle = "rgba(0,255,204,0.35)";
    // Top-left corner HUD
    ctx.textAlign = "left";
    ctx.fillText("▸ GPS ATIVO", w * 0.04, h * 0.03 + logoSize + 8);
    // Top-right corner HUD
    ctx.textAlign = "right";
    ctx.fillText("█████░░ 78%", w * 0.96, h * 0.03 + termSize * 2 + 12);
    // Bottom-left corner HUD
    ctx.textAlign = "left";
    ctx.fillText("LAT -23.5505", w * 0.04, h * 0.92);
    ctx.fillText("LNG -46.6333", w * 0.04, h * 0.92 + hudSize + 3);
    // Bottom-right corner HUD (before data box)
    ctx.textAlign = "right";
    ctx.fillText("▸ REC", w * 0.96, h * 0.92 + hudSize + 3);

    // Center phrase — big neon glow like a luminous sign
    const phraseSize = Math.round(w * 0.055);
    ctx.font = `900 italic ${phraseSize}px sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = cyan;
    ctx.shadowBlur = 30;
    drawWrappedText(ctx, phrase, w / 2, h * 0.43, w * 0.85, phraseSize * 1.3);
    ctx.shadowBlur = 0;

    // Bottom-right: run data HUD box with magenta neon border
    if (runData) {
      const boxW = w * 0.42;
      const boxH = h * 0.12;
      const boxX = w * 0.95 - boxW;
      const boxY = h * 0.75;

      // Dark box background
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // Magenta neon border
      ctx.strokeStyle = magenta;
      ctx.lineWidth = 2;
      ctx.shadowColor = magenta;
      ctx.shadowBlur = 12;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.shadowBlur = 0;

      // Data inside with monospace
      const dataSize = Math.round(w * 0.028);
      const valSize = Math.round(w * 0.045);
      ctx.font = `600 ${dataSize}px monospace`;
      ctx.textAlign = "left";
      ctx.fillStyle = magenta;
      ctx.fillText("ÚLTIMA CORRIDA", boxX + 12, boxY + dataSize + 6);

      ctx.font = `700 ${dataSize}px monospace`;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("PACE", boxX + 12, boxY + boxH * 0.5);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("DIST", boxX + boxW * 0.5, boxY + boxH * 0.5);

      ctx.font = `900 ${valSize}px monospace`;
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = cyan;
      ctx.shadowBlur = 4;
      ctx.fillText(runData.pace, boxX + 12, boxY + boxH * 0.5 + valSize + 2);
      ctx.fillText(runData.distance, boxX + boxW * 0.5, boxY + boxH * 0.5 + valSize + 2);
      ctx.shadowBlur = 0;
    }

    // Bottom center: REGISTREI MINHA VITÓRIA + site
    const titleSize = Math.round(w * 0.042);
    ctx.font = `900 ${titleSize}px sans-serif`;
    ctx.fillStyle = cyan;
    ctx.shadowColor = cyan;
    ctx.shadowBlur = 20;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("REGISTREI MINHA VITÓRIA!", w / 2, h * 0.96);
    ctx.shadowBlur = 0;

    ctx.font = `500 ${Math.round(w * 0.022)}px monospace`;
    ctx.fillStyle = "rgba(0,255,204,0.4)";
    ctx.fillText("planopace.vercel.app", w / 2, h * 0.985);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // ========================================
  // COFFEE — Kraft paper, circular stamp, receipt
  // ========================================
  function drawCoffeeFullOverlay(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    phrase: string, runData: LastRunData | null
  ) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const brown = "#C87533";
    const darkBrown = "#8B5A2B";
    const cream = "#F5E6D0";

    // Kraft paper overlay covering everything
    ctx.fillStyle = "rgba(210,180,140,0.35)";
    ctx.fillRect(0, 0, w, h);

    // Grain/noise dots for paper texture
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = darkBrown;
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Coffee stain top-right corner
    ctx.save();
    ctx.strokeStyle = darkBrown;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.08, w * 0.07, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.04;
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.08, w * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Coffee stain bottom-left corner
    ctx.save();
    ctx.strokeStyle = darkBrown;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w * 0.12, h * 0.88, w * 0.06, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Top: "PLANOPACE" in brush/handwritten style
    const logoSize = Math.round(w * 0.08);
    ctx.font = `900 italic ${logoSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = brown;
    ctx.shadowColor = "rgba(139,90,43,0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText("PLANOPACE", w / 2, h * 0.06);
    ctx.shadowBlur = 0;

    // Small text under logo
    const subSize = Math.round(w * 0.022);
    ctx.font = `500 ${subSize}px monospace`;
    ctx.fillStyle = "rgba(139,90,43,0.6)";
    ctx.fillText(`${dateStr}  •  ${timeStr}`, w / 2, h * 0.06 + logoSize * 0.6);

    // Circular stamp photo frame — dentate border
    const cx = w / 2;
    const cy = h * 0.38;
    const outerR = w * 0.32;
    const innerR = outerR - 8;

    // Outer dentate circle
    ctx.save();
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const teeth = 72;
    for (let i = 0; i <= teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const r = i % 2 === 0 ? outerR : outerR - 6;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Inner circle border
    ctx.save();
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Dark circle mask outside the stamp (to make photo circular)
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    // Actually, we draw over the existing photo, so just add the decorative elements
    ctx.restore();

    // Receipt/comanda section below the stamp
    const receiptY = cy + outerR + 20;
    const receiptX = w * 0.1;
    const receiptW = w * 0.8;

    // Dotted line separator
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = darkBrown;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(receiptX, receiptY);
    ctx.lineTo(receiptX + receiptW, receiptY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();

    if (runData) {
      const rSize = Math.round(w * 0.03);
      const rBig = Math.round(w * 0.028);
      ctx.font = `700 ${rSize}px monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = darkBrown;

      const orderNum = String(Math.floor(Math.random() * 9000) + 1000);
      ctx.fillText(`PEDIDO #${orderNum}`, w / 2, receiptY + rSize + 10);

      ctx.font = `600 ${rBig}px monospace`;
      ctx.fillStyle = "rgba(60,30,10,0.8)";
      ctx.fillText(`${runData.distance} ao pace ${runData.pace}`, w / 2, receiptY + rSize * 2 + 18);

      ctx.font = `800 ${rBig}px monospace`;
      ctx.fillStyle = brown;
      ctx.fillText("SERVIDO QUENTE ☕", w / 2, receiptY + rSize * 3 + 26);

      // Another dotted line
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = darkBrown;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(receiptX, receiptY + rSize * 4 + 30);
      ctx.lineTo(receiptX + receiptW, receiptY + rSize * 4 + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.restore();

      // Map if available
      if (runData.polyline) {
        const mapY = receiptY + rSize * 4 + 40;
        const mapSize = w * 0.3;
        drawRouteMap(ctx, runData.polyline, w / 2 - mapSize / 2, mapY, mapSize, mapSize, brown, brown);
      }
    }

    // Bottom: phrase in italic cursive
    const phraseSize = Math.round(w * 0.038);
    ctx.font = `700 italic ${phraseSize}px serif`;
    ctx.fillStyle = darkBrown;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    drawWrappedText(ctx, phrase, w / 2, h * 0.85, w * 0.8, phraseSize * 1.4);

    // REGISTREI MINHA VITÓRIA
    const titleSize = Math.round(w * 0.04);
    ctx.font = `900 ${titleSize}px serif`;
    ctx.fillStyle = brown;
    ctx.fillText("REGISTREI MINHA VITÓRIA!", w / 2, h * 0.94);

    ctx.font = `500 ${Math.round(w * 0.022)}px monospace`;
    ctx.fillStyle = "rgba(139,90,43,0.5)";
    ctx.fillText("planopace.vercel.app", w / 2, h * 0.97);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // ========================================
  // MILITARY — Briefing layout with horizontal bands
  // ========================================
  function drawMilitaryFullOverlay(
    ctx: CanvasRenderingContext2D, w: number, h: number,
    phrase: string, runData: LastRunData | null
  ) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const milGreen = "#4ADE50";
    const yellow = "#FACC15";

    // Subtle camo pattern overlay
    ctx.save();
    ctx.globalAlpha = 0.06;
    const camoColors = ["#2D4A1E", "#3B5E2B", "#1A3310", "#4A6B35"];
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = camoColors[i % camoColors.length];
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const rx = 30 + Math.random() * 80;
      const ry = 20 + Math.random() * 50;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Dark film grain overlay
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, w, h);

    // === TOP BAND — military green header ===
    const topBandH = h * 0.055;
    ctx.fillStyle = "rgba(30,50,20,0.92)";
    ctx.fillRect(0, 0, w, topBandH);
    // Green line under top band
    ctx.fillStyle = milGreen;
    ctx.shadowColor = milGreen;
    ctx.shadowBlur = 4;
    ctx.fillRect(0, topBandH - 2, w, 2);
    ctx.shadowBlur = 0;

    // Stencil header text
    const stencilSize = Math.round(w * 0.03);
    ctx.font = `800 ${stencilSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("PLANOPACE — BRIEFING DE MISSÃO", w * 0.04, topBandH / 2);

    ctx.textAlign = "right";
    ctx.font = `600 ${Math.round(w * 0.022)}px monospace`;
    ctx.fillStyle = milGreen;
    ctx.fillText(`${dateStr}  ${timeStr}`, w * 0.96, topBandH / 2);

    // === BOTTOM ZONE — split into 2 columns ===
    const bottomZoneY = h * 0.65;
    const bottomZoneH = h * 0.25;

    // Dark background for bottom zone
    ctx.fillStyle = "rgba(5,10,5,0.85)";
    ctx.fillRect(0, bottomZoneY, w, bottomZoneH);

    // Green line on top of bottom zone
    ctx.fillStyle = milGreen;
    ctx.shadowColor = milGreen;
    ctx.shadowBlur = 4;
    ctx.fillRect(0, bottomZoneY, w, 2);
    ctx.shadowBlur = 0;

    // Left column: mission data
    const colW = w * 0.48;
    const colPad = w * 0.04;
    const dataX = colPad;
    const dataFontSize = Math.round(w * 0.025);
    const dataValSize = Math.round(w * 0.03);

    ctx.font = `800 ${dataFontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let dataY = bottomZoneY + 14;
    ctx.fillStyle = milGreen;
    ctx.fillText("▸ RELATÓRIO DE MISSÃO", dataX, dataY);
    dataY += dataFontSize + 10;

    if (runData) {
      ctx.font = `600 ${dataValSize}px monospace`;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`MISSÃO: ${runData.distance}`, dataX, dataY);
      dataY += dataValSize + 6;
      ctx.fillText(`PACE: ${runData.pace}`, dataX, dataY);
      dataY += dataValSize + 6;
      ctx.fillStyle = milGreen;
      ctx.fillText("STATUS: SOBREVIVEU ✓", dataX, dataY);
      dataY += dataValSize + 6;
    } else {
      ctx.font = `600 ${dataValSize}px monospace`;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("SEM DADOS DE MISSÃO", dataX, dataY);
      dataY += dataValSize + 6;
    }

    // Right column: tactical map (radar style)
    const mapColX = colW + colPad;
    const mapSize = Math.min(colW - colPad * 2, bottomZoneH - 30);
    const mapCX = mapColX + mapSize / 2 + 10;
    const mapCY = bottomZoneY + 14 + mapSize / 2;

    // Radar circles
    ctx.save();
    ctx.strokeStyle = milGreen;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(mapCX, mapCY, (mapSize / 2) * (r / 3), 0, Math.PI * 2);
      ctx.stroke();
    }
    // Radar crosshairs
    ctx.beginPath();
    ctx.moveTo(mapCX - mapSize / 2, mapCY);
    ctx.lineTo(mapCX + mapSize / 2, mapCY);
    ctx.moveTo(mapCX, mapCY - mapSize / 2);
    ctx.lineTo(mapCX, mapCY + mapSize / 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Draw route on radar
    if (runData?.polyline) {
      drawRouteMap(
        ctx, runData.polyline,
        mapCX - mapSize / 2, mapCY - mapSize / 2, mapSize, mapSize,
        milGreen, milGreen
      );
    }

    // Radar label
    ctx.font = `600 ${Math.round(w * 0.018)}px monospace`;
    ctx.fillStyle = milGreen;
    ctx.globalAlpha = 0.5;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("MAPA TÁTICO", mapCX, mapCY + mapSize / 2 + 4);
    ctx.globalAlpha = 1;

    // === BOTTOM BAR — loading bar + phrase ===
    const barY = bottomZoneY + bottomZoneH;
    const barH = h - barY;

    ctx.fillStyle = "rgba(10,15,5,0.9)";
    ctx.fillRect(0, barY, w, barH);

    // Loading/progress bar
    const loadBarX = w * 0.04;
    const loadBarW = w * 0.92;
    const loadBarY = barY + 12;
    const loadBarH = 8;

    // Bar background
    ctx.fillStyle = "rgba(74,222,80,0.15)";
    ctx.fillRect(loadBarX, loadBarY, loadBarW, loadBarH);
    // Bar fill (random progress)
    ctx.fillStyle = milGreen;
    ctx.shadowColor = milGreen;
    ctx.shadowBlur = 4;
    ctx.fillRect(loadBarX, loadBarY, loadBarW * 0.78, loadBarH);
    ctx.shadowBlur = 0;

    // Phrase in yellow alert
    const phraseSize = Math.round(w * 0.035);
    ctx.font = `800 ${phraseSize}px monospace`;
    ctx.fillStyle = yellow;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = yellow;
    ctx.shadowBlur = 4;
    drawWrappedText(ctx, phrase, w / 2, loadBarY + loadBarH + 14, w * 0.9, phraseSize * 1.3);
    ctx.shadowBlur = 0;

    // REGISTREI MINHA VITÓRIA
    const titleSize = Math.round(w * 0.038);
    ctx.font = `900 ${titleSize}px monospace`;
    ctx.fillStyle = milGreen;
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = milGreen;
    ctx.shadowBlur = 8;
    ctx.fillText("REGISTREI MINHA VITÓRIA!", w / 2, h * 0.955);
    ctx.shadowBlur = 0;

    ctx.font = `500 ${Math.round(w * 0.02)}px monospace`;
    ctx.fillStyle = "rgba(74,222,80,0.4)";
    ctx.fillText("planopace.vercel.app", w / 2, h * 0.985);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // ========== LANDSCAPE (clean, minimal — logo top + data bottom) ==========
  function drawLandscapeFullOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    runData: LastRunData | null
  ) {
    // Subtle bottom gradient for readability
    const botGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
    botGrad.addColorStop(0, "rgba(0,0,0,0)");
    botGrad.addColorStop(0.5, "rgba(0,0,0,0.3)");
    botGrad.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle top gradient for logo readability
    const topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.12);
    topGrad.addColorStop(0, "rgba(0,0,0,0.5)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, h * 0.12);

    // Top-left: PLANOPACE logo (small, white, clean)
    const logoSize = Math.round(w * 0.05);
    ctx.font = `900 italic ${logoSize}px sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 10;
    ctx.fillText("PLANOPACE", w * 0.05, h * 0.03);
    ctx.shadowBlur = 0;

    // Strava logo area (top-left, below PLANOPACE)
    const stravaSize = Math.round(w * 0.028);
    ctx.font = `700 ${stravaSize}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("⟡ STRAVA", w * 0.05, h * 0.03 + logoSize + 8);

    // Bottom data: distance, pace, time — only if run data exists
    if (runData) {
      const dataY = h * 0.88;
      const labelSize = Math.round(w * 0.028);
      const valueSize = Math.round(w * 0.055);

      // Parse distance and pace
      const distLabel = "Distância";
      const distValue = runData.distance;
      const paceLabel = "Ritmo";
      const paceValue = runData.pace;

      // 3 columns evenly spaced
      const colWidth = w / 3;
      const cols = [
        { label: distLabel, value: distValue },
        { label: paceLabel, value: paceValue },
      ];

      // Position: left-aligned at bottom
      const startX = w * 0.05;

      ctx.textBaseline = "top";

      for (let i = 0; i < cols.length; i++) {
        const x = startX + i * (w * 0.32);

        // Label
        ctx.font = `500 ${labelSize}px sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "left";
        ctx.fillText(cols[i].label, x, dataY);

        // Value
        ctx.font = `800 ${valueSize}px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 6;
        ctx.fillText(cols[i].value, x, dataY + labelSize + 4);
        ctx.shadowBlur = 0;
      }

      // Mini route map on the right if polyline exists
      if (runData.polyline) {
        const mapSize = Math.round(w * 0.18);
        const mapX = w * 0.78;
        const mapY = dataY - mapSize * 0.1;
        drawRouteMap(ctx, runData.polyline, mapX, mapY, mapSize, mapSize, "rgba(255,255,255,0.6)", "rgba(255,255,255,0.2)");
      }
    }

    // Bottom: planopace.vercel.app (very subtle)
    ctx.font = `500 ${Math.round(w * 0.022)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("planopace.vercel.app", w * 0.05, h * 0.975);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
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

              {/* ============ NIGHT LIVE OVERLAY ============ */}
              {filterType === "night" && (
                <>
                  {/* Scanlines */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(0,255,204,0.04) 0px, transparent 1px, transparent 4px)` }}
                  />
                  {/* Top-left: logo */}
                  <div className="absolute top-[3%] left-[4%]">
                    <span className="text-[4.5vw] sm:text-xl font-black italic" style={{ textShadow: "0 0 25px #00FFCC" }}>
                      PLANO<span style={{ color: "#00FFCC" }}>PACE</span>
                    </span>
                    <p className="text-[1.6vw] sm:text-[7px] font-mono mt-0.5" style={{ color: "rgba(0,255,204,0.35)" }}>▸ GPS ATIVO</p>
                  </div>
                  {/* Top-right: terminal date/time */}
                  <div className="absolute top-[3%] right-[4%] text-right">
                    <p className="text-[2.2vw] sm:text-xs font-mono font-semibold" style={{ color: "#00FF41", textShadow: "0 0 4px #00FF41" }}>{currentDate}</p>
                    <p className="text-[2.2vw] sm:text-xs font-mono font-semibold" style={{ color: "#00FF41", textShadow: "0 0 4px #00FF41" }}>{currentTime}</p>
                    <p className="text-[1.6vw] sm:text-[7px] font-mono mt-1" style={{ color: "rgba(0,255,204,0.35)" }}>█████░░ 78%</p>
                  </div>
                  {/* HUD corners */}
                  <p className="absolute bottom-[10%] left-[4%] text-[1.6vw] sm:text-[7px] font-mono" style={{ color: "rgba(0,255,204,0.35)" }}>LAT -23.5505<br/>LNG -46.6333</p>
                  <p className="absolute bottom-[10%] right-[4%] text-[1.6vw] sm:text-[7px] font-mono text-right" style={{ color: "rgba(0,255,204,0.35)" }}>▸ REC</p>
                  {/* Center phrase - big neon */}
                  <div className="absolute inset-0 flex items-center justify-center px-6">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="text-[4.5vw] sm:text-lg font-black italic text-white text-center leading-tight"
                        style={{ textShadow: "0 0 30px #00FFCC, 0 0 60px rgba(0,255,204,0.3)" }}
                      >
                        {phrases[phraseIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  {/* Bottom-right HUD data box */}
                  {lastRun && (
                    <div className="absolute right-[3%] bottom-[14%]">
                      <div
                        className="bg-black/70 backdrop-blur-sm px-3 py-2 border-[2px]"
                        style={{ borderColor: "#FF00FF", boxShadow: "0 0 12px rgba(255,0,255,0.3)" }}
                      >
                        <p className="text-[1.8vw] sm:text-[8px] font-mono font-bold" style={{ color: "#FF00FF" }}>ÚLTIMA CORRIDA</p>
                        <div className="flex gap-3 mt-1">
                          <div>
                            <p className="text-[1.5vw] sm:text-[7px] text-white/50 font-mono">PACE</p>
                            <p className="text-[3vw] sm:text-sm font-mono font-bold text-white" style={{ textShadow: "0 0 4px #00FFCC" }}>{lastRun.pace}</p>
                          </div>
                          <div>
                            <p className="text-[1.5vw] sm:text-[7px] text-white/50 font-mono">DIST</p>
                            <p className="text-[3vw] sm:text-sm font-mono font-bold text-white" style={{ textShadow: "0 0 4px #00FFCC" }}>{lastRun.distance}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Bottom title */}
                  <div className="absolute bottom-[2%] left-0 right-0 text-center">
                    <p className="text-[3.8vw] sm:text-base font-black" style={{ color: "#00FFCC", textShadow: "0 0 20px #00FFCC" }}>REGISTREI MINHA VITÓRIA!</p>
                    <p className="text-[1.8vw] sm:text-[8px] font-mono" style={{ color: "rgba(0,255,204,0.4)" }}>planopace.vercel.app</p>
                  </div>
                  {/* Tap hint */}
                  <div className="absolute top-[45%] left-0 right-0 flex justify-center">
                    <span className="text-[1.8vw] sm:text-[8px] text-white/20 font-mono">toque para mudar a frase</span>
                  </div>
                </>
              )}

              {/* ============ COFFEE LIVE OVERLAY ============ */}
              {filterType === "coffee" && (
                <>
                  {/* Kraft paper tint */}
                  <div className="absolute inset-0" style={{ backgroundColor: "rgba(210,180,140,0.25)" }} />
                  {/* Coffee stain top-right */}
                  <div className="absolute top-[4%] right-[8%] w-[14vw] h-[14vw] rounded-full border-[4px] opacity-[0.1]" style={{ borderColor: "#8B5A2B" }} />
                  {/* Coffee stain bottom-left */}
                  <div className="absolute bottom-[14%] left-[6%] w-[12vw] h-[12vw] rounded-full border-[3px] opacity-[0.08]" style={{ borderColor: "#8B5A2B" }} />
                  {/* Top: PLANOPACE brush */}
                  <div className="absolute top-[3%] left-0 right-0 text-center">
                    <span className="text-[7vw] sm:text-3xl font-black italic" style={{ fontFamily: "serif", color: "#C87533", textShadow: "0 2px 4px rgba(139,90,43,0.3)" }}>PLANOPACE</span>
                    <p className="text-[2vw] sm:text-[9px] font-mono mt-0.5" style={{ color: "rgba(139,90,43,0.6)" }}>{currentDate} • {currentTime}</p>
                  </div>
                  {/* Circular stamp border */}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ top: "-5%" }}>
                    <div className="rounded-full border-[3px] border-dashed" style={{ width: "60vw", height: "60vw", borderColor: "#8B5A2B" }} />
                  </div>
                  {/* Receipt data */}
                  {lastRun && (
                    <div className="absolute bottom-[22%] left-0 right-0 text-center">
                      <div className="border-t border-dashed mx-[10%] mb-2" style={{ borderColor: "rgba(139,90,43,0.4)" }} />
                      <p className="text-[2.5vw] sm:text-[10px] font-mono font-bold" style={{ color: "#8B5A2B" }}>PEDIDO #0302</p>
                      <p className="text-[2.2vw] sm:text-[9px] font-mono" style={{ color: "rgba(60,30,10,0.7)" }}>{lastRun.distance} ao pace {lastRun.pace}</p>
                      <p className="text-[2.2vw] sm:text-[9px] font-mono font-bold mt-0.5" style={{ color: "#C87533" }}>SERVIDO QUENTE ☕</p>
                      <div className="border-t border-dashed mx-[10%] mt-2" style={{ borderColor: "rgba(139,90,43,0.4)" }} />
                    </div>
                  )}
                  {/* Bottom phrase - italic */}
                  <div className="absolute bottom-[6%] left-0 right-0 px-6">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="text-[3.2vw] sm:text-sm font-bold italic text-center leading-tight"
                        style={{ fontFamily: "serif", color: "#8B5A2B" }}
                      >
                        {phrases[phraseIndex]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-center mt-1 text-[3.5vw] sm:text-sm font-black" style={{ fontFamily: "serif", color: "#C87533" }}>REGISTREI MINHA VITÓRIA!</p>
                    <p className="text-center text-[1.8vw] sm:text-[8px] font-mono" style={{ color: "rgba(139,90,43,0.5)" }}>planopace.vercel.app</p>
                  </div>
                  {/* Tap hint */}
                  <div className="absolute bottom-[30%] left-0 right-0 flex justify-center">
                    <span className="text-[1.8vw] sm:text-[8px] font-mono" style={{ color: "rgba(139,90,43,0.3)" }}>toque para mudar a frase</span>
                  </div>
                </>
              )}

              {/* ============ MILITARY LIVE OVERLAY ============ */}
              {filterType === "military" && (
                <>
                  {/* Subtle camo tint */}
                  <div className="absolute inset-0" style={{ backgroundColor: "rgba(30,50,20,0.15)" }} />
                  {/* Top band - green header */}
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-[4%]" style={{ height: "5.5%", backgroundColor: "rgba(30,50,20,0.92)" }}>
                    <span className="text-[2.5vw] sm:text-[10px] font-mono font-extrabold text-white">PLANOPACE — BRIEFING DE MISSÃO</span>
                    <span className="text-[2vw] sm:text-[8px] font-mono font-semibold" style={{ color: "#4ADE50" }}>{currentDate} {currentTime}</span>
                  </div>
                  <div className="absolute left-0 right-0 h-[2px]" style={{ top: "5.5%", backgroundColor: "#4ADE50", boxShadow: "0 0 4px #4ADE50" }} />
                  {/* Bottom zone - dark with data */}
                  <div className="absolute left-0 right-0" style={{ top: "65%", height: "25%", backgroundColor: "rgba(5,10,5,0.85)" }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: "#4ADE50", boxShadow: "0 0 4px #4ADE50" }} />
                    {/* Left column: mission data */}
                    <div className="absolute left-[4%] top-3">
                      <p className="text-[1.8vw] sm:text-[8px] font-mono font-extrabold" style={{ color: "#4ADE50" }}>▸ RELATÓRIO DE MISSÃO</p>
                      {lastRun ? (
                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-[2.2vw] sm:text-[9px] font-mono font-semibold text-white">MISSÃO: {lastRun.distance}</p>
                          <p className="text-[2.2vw] sm:text-[9px] font-mono font-semibold text-white">PACE: {lastRun.pace}</p>
                          <p className="text-[2.2vw] sm:text-[9px] font-mono font-semibold" style={{ color: "#4ADE50" }}>STATUS: SOBREVIVEU ✓</p>
                        </div>
                      ) : (
                        <p className="text-[2vw] sm:text-[8px] font-mono text-white/50 mt-1">SEM DADOS DE MISSÃO</p>
                      )}
                    </div>
                    {/* Right column: radar circles */}
                    <div className="absolute right-[8%] top-3 flex items-center justify-center" style={{ width: "20vw", height: "20vw" }}>
                      <div className="relative w-full h-full opacity-20">
                        <div className="absolute inset-[15%] rounded-full border" style={{ borderColor: "#4ADE50" }} />
                        <div className="absolute inset-[30%] rounded-full border" style={{ borderColor: "#4ADE50" }} />
                        <div className="absolute inset-[45%] rounded-full border" style={{ borderColor: "#4ADE50" }} />
                        <div className="absolute top-1/2 left-0 right-0 h-[1px]" style={{ backgroundColor: "#4ADE50" }} />
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px]" style={{ backgroundColor: "#4ADE50" }} />
                      </div>
                      {lastRun?.polyline && (
                        <div className="absolute inset-[10%]">
                          <PolylineMiniMap polyline={lastRun.polyline} accent="#4ADE50" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 px-[4%] py-2" style={{ backgroundColor: "rgba(10,15,5,0.9)" }}>
                    {/* Loading bar */}
                    <div className="w-full h-[6px] mb-2 rounded-full" style={{ backgroundColor: "rgba(74,222,80,0.15)" }}>
                      <div className="h-full rounded-full" style={{ width: "78%", backgroundColor: "#4ADE50", boxShadow: "0 0 4px #4ADE50" }} />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.25 }}
                        className="text-[2.8vw] sm:text-xs font-mono font-extrabold text-center"
                        style={{ color: "#FACC15", textShadow: "0 0 4px #FACC15" }}
                      >
                        {phrases[phraseIndex]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-center text-[3vw] sm:text-sm font-mono font-black mt-1" style={{ color: "#4ADE50", textShadow: "0 0 8px #4ADE50" }}>REGISTREI MINHA VITÓRIA!</p>
                    <p className="text-center text-[1.6vw] sm:text-[7px] font-mono" style={{ color: "rgba(74,222,80,0.4)" }}>planopace.vercel.app</p>
                  </div>
                  {/* Tap hint */}
                  <div className="absolute bottom-[32%] left-0 right-0 flex justify-center">
                    <span className="text-[1.8vw] sm:text-[8px] font-mono" style={{ color: "rgba(74,222,80,0.25)" }}>toque para mudar a frase</span>
                  </div>
                </>
              )}

              {/* ============ LANDSCAPE LIVE OVERLAY ============ */}
              {filterType === "landscape" && (
                <>
                  {/* Top gradient */}
                  <div className="absolute top-0 left-0 right-0" style={{ height: "12%", background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }} />
                  {/* Top-left: logo */}
                  <div className="absolute top-[3%] left-[5%]">
                    <span className="text-[5vw] sm:text-xl font-black italic text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                      PLANOPACE
                    </span>
                    <p className="text-[2vw] sm:text-[8px] font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>⟡ STRAVA</p>
                  </div>
                  {/* Bottom gradient + data */}
                  <div className="absolute bottom-0 left-0 right-0" style={{ height: "30%", background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.3) 50%, transparent)" }} />
                  {lastRun && (
                    <div className="absolute bottom-[6%] left-[5%] flex gap-[8vw]">
                      <div>
                        <p className="text-[2.5vw] sm:text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Distância</p>
                        <p className="text-[5.5vw] sm:text-2xl font-extrabold text-white" style={{ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>{lastRun.distance}</p>
                      </div>
                      <div>
                        <p className="text-[2.5vw] sm:text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Ritmo</p>
                        <p className="text-[5.5vw] sm:text-2xl font-extrabold text-white" style={{ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>{lastRun.pace}</p>
                      </div>
                    </div>
                  )}
                  {lastRun?.polyline && (
                    <div className="absolute bottom-[5%] right-[5%]" style={{ width: "18vw", height: "18vw", opacity: 0.6 }}>
                      <PolylineMiniMap polyline={lastRun.polyline} accent="rgba(255,255,255,0.6)" />
                    </div>
                  )}
                  <div className="absolute bottom-[2%] left-[5%]">
                    <p className="text-[2vw] sm:text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>planopace.vercel.app</p>
                  </div>
                </>
              )}

              {/* ============ DEFAULT FILTERS (neon, ice, wanted, zen) ============ */}
              {filterType !== "night" && filterType !== "coffee" && filterType !== "military" && filterType !== "landscape" && (
                <>
                  {/* Filter-specific additions */}
                  {filterType === "wanted" && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
                      <span className="text-[15vw] font-black opacity-[0.06] tracking-widest" style={{ fontFamily: "serif", color: accent }}>
                        PROCURADO
                      </span>
                    </div>
                  )}
                  {filterType === "zen" && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
                      <div className="rounded-full border-[3px] opacity-[0.08]" style={{ width: "30vw", height: "30vw", borderColor: accent }} />
                    </div>
                  )}

                  {/* Top band */}
                  <div
                    className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center pt-3 pb-6"
                    style={{ height: "10%", background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)" }}
                  >
                    <span className="text-[5vw] sm:text-2xl font-black italic tracking-tight" style={{ textShadow: `0 0 20px ${accent}` }}>
                      PLANO<span style={{ color: accent }}>PACE</span>
                    </span>
                    <span className="text-[2.2vw] sm:text-xs text-white/50 font-mono mt-0.5">
                      {currentDate} &bull; {currentTime}
                    </span>
                  </div>

                  {/* Accent glow line */}
                  <div
                    className="absolute left-0 right-0 h-[3px]"
                    style={{ top: "8.5%", backgroundColor: accent, boxShadow: `0 0 15px ${accent}, 0 0 30px ${accent}` }}
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
                      style={{ borderColor: accent, boxShadow: `${c.shadow} ${accent}` }}
                    />
                  ))}

                  {/* Last run data */}
                  {lastRun && (
                    <div className="absolute right-[3%] flex flex-col items-end" style={{ top: "42%" }}>
                      <div
                        className="bg-black/65 backdrop-blur-sm rounded-xl px-3 py-2.5 border-l-[3px]"
                        style={{ borderColor: accent, boxShadow: `0 0 10px ${config.accentGlow}0.2)` }}
                      >
                        <p className="text-[2vw] sm:text-[10px] font-bold tracking-wider mb-1.5" style={{ color: accent }}>ÚLTIMA CORRIDA</p>
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
                        {lastRun.polyline && <PolylineMiniMap polyline={lastRun.polyline} accent={accent} />}
                      </div>
                    </div>
                  )}

                  {/* Bottom band */}
                  <div
                    className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-4 pt-10"
                    style={{ height: "22%", background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7) 60%, transparent)" }}
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
                    <p className="text-[4.5vw] sm:text-xl font-black tracking-tight mb-1" style={{ color: accent, textShadow: `0 0 20px ${accent}` }}>
                      REGISTREI MINHA VITÓRIA!
                    </p>
                    <p className="text-white/40 text-[2.3vw] sm:text-xs font-medium">planopace.vercel.app</p>
                  </div>

                  {/* Tap hint */}
                  <div className="absolute bottom-[23%] left-0 right-0 flex justify-center">
                    <span className="text-[2vw] sm:text-[10px] text-white/30 font-medium">toque para mudar a frase</span>
                  </div>
                </>
              )}
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
