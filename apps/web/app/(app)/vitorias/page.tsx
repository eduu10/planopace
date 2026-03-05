"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Trophy,
  X,
  Download,
  Flame,
  Snowflake,
  Skull,
  Leaf,
  Moon,
  Coffee,
  Shield,
  Mountain,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useVictories, type VictoryPhoto } from "@/stores/victories";
import CameraCapture from "@/components/victory/CameraCapture";
import VictoryCard from "@/components/victory/VictoryCard";
import { type FilterType, FILTER_CONFIGS } from "@/components/victory/filters";

interface FilterOrb {
  id: FilterType;
  icon: React.ReactNode;
  bg: string;
  via: string;
}

const FILTER_ORBS: FilterOrb[] = [
  {
    id: "neon",
    icon: <Flame className="w-7 h-7 text-[#FF6B00] relative z-10" style={{ filter: "drop-shadow(0 0 6px #FF6B00)" }} />,
    bg: "from-gray-900 via-orange-950 to-gray-900",
    via: "via-orange-500/10",
  },
  {
    id: "ice",
    icon: <Snowflake className="w-7 h-7 text-[#00D4FF] relative z-10" style={{ filter: "drop-shadow(0 0 6px #00D4FF)" }} />,
    bg: "from-gray-900 via-cyan-950 to-gray-900",
    via: "via-cyan-400/10",
  },
  {
    id: "wanted",
    icon: <Skull className="w-7 h-7 text-[#DC2626] relative z-10" style={{ filter: "drop-shadow(0 0 6px #DC2626)" }} />,
    bg: "from-gray-900 via-red-950 to-gray-900",
    via: "via-red-500/10",
  },
  {
    id: "zen",
    icon: <Leaf className="w-7 h-7 text-[#D4A853] relative z-10" style={{ filter: "drop-shadow(0 0 6px #D4A853)" }} />,
    bg: "from-gray-900 via-yellow-950 to-gray-900",
    via: "via-yellow-400/10",
  },
  {
    id: "night",
    icon: <Moon className="w-7 h-7 text-[#00FFCC] relative z-10" style={{ filter: "drop-shadow(0 0 6px #00FFCC)" }} />,
    bg: "from-gray-900 via-purple-950 to-gray-900",
    via: "via-purple-400/10",
  },
  {
    id: "coffee",
    icon: <Coffee className="w-7 h-7 text-[#C87533] relative z-10" style={{ filter: "drop-shadow(0 0 6px #C87533)" }} />,
    bg: "from-gray-900 via-amber-950 to-gray-900",
    via: "via-amber-500/10",
  },
  {
    id: "landscape",
    icon: <Mountain className="w-7 h-7 text-white relative z-10" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }} />,
    bg: "from-gray-900 via-emerald-950 to-gray-900",
    via: "via-emerald-400/10",
  },
  {
    id: "military",
    icon: <Shield className="w-7 h-7 text-[#FACC15] relative z-10" style={{ filter: "drop-shadow(0 0 6px #FACC15)" }} />,
    bg: "from-gray-900 via-green-950 to-gray-900",
    via: "via-green-500/10",
  },
];

export default function VitoriasPage() {
  const { user } = useAuth();
  const { victories, hydrate, addVictory, deleteVictory } = useVictories();
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [preview, setPreview] = useState<VictoryPhoto | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const myVictories = user ? victories.filter((v) => v.userId === user.id) : [];

  const handleCapture = (imageData: string) => {
    if (!user) return;
    const success = addVictory({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      imageData,
    });
    if (!success) {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
    }
    setShowCamera(false);
  };

  const handleRegister = () => {
    if (!selectedFilter) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2500);
      return;
    }
    setShowCamera(true);
  };

  const handleDownload = (v: VictoryPhoto) => {
    const link = document.createElement("a");
    link.href = v.imageData;
    link.download = `vitoria-planopace-${Date.now()}.jpg`;
    link.click();
  };

  const selectedConfig = selectedFilter ? FILTER_CONFIGS[selectedFilter] : null;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-orange-500" />
            Minhas Vitórias
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {myVictories.length} {myVictories.length === 1 ? "foto" : "fotos"} registradas
          </p>
        </div>
      </div>

      {/* Filter Selection */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">Escolha um filtro</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {FILTER_ORBS.map((orb) => {
            const cfg = FILTER_CONFIGS[orb.id];
            const isSelected = selectedFilter === orb.id;
            return (
              <button
                key={orb.id}
                onClick={() => setSelectedFilter(orb.id)}
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  isSelected ? "scale-105" : "opacity-60 hover:opacity-80"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden relative border-[3px] transition-all ${
                    isSelected
                      ? `shadow-[0_0_18px_${cfg.accent}80]`
                      : "border-gray-600"
                  }`}
                  style={{
                    borderColor: isSelected ? cfg.accent : undefined,
                    boxShadow: isSelected ? `0 0 18px ${cfg.accentGlow}0.5)` : undefined,
                  }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${orb.bg} flex items-center justify-center relative`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-transparent ${orb.via} to-transparent`} />
                    {orb.icon}
                    {/* Corner brackets mini */}
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 border-l-[2px] border-t-[2px]" style={{ borderColor: `${cfg.accent}99` }} />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 border-r-[2px] border-t-[2px]" style={{ borderColor: `${cfg.accent}99` }} />
                    <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-l-[2px] border-b-[2px]" style={{ borderColor: `${cfg.accent}99` }} />
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-r-[2px] border-b-[2px]" style={{ borderColor: `${cfg.accent}99` }} />
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold leading-tight text-center max-w-[64px]"
                  style={{ color: isSelected ? cfg.accent : "#6b7280" }}
                >
                  {cfg.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint message */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center text-sm text-amber-400 mb-3 font-medium"
          >
            Escolha um filtro acima para continuar!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capture Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleRegister}
        className={`w-full rounded-2xl p-5 flex items-center justify-center gap-3 font-bold text-lg mb-6 active:scale-[0.98] transition-all ${
          selectedFilter
            ? "text-white"
            : "bg-gray-700/50 text-gray-500 cursor-default"
        }`}
        style={
          selectedConfig
            ? {
                background: `linear-gradient(to right, ${selectedConfig.accent}CC, ${selectedConfig.accent})`,
                boxShadow: `0 0 20px ${selectedConfig.accentGlow}0.3)`,
              }
            : undefined
        }
      >
        <Camera className="w-6 h-6" />
        Registrar Vitória
      </motion.button>

      {/* Storage error */}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm text-red-400">
          Espaço insuficiente. Delete fotos antigas para continuar.
        </div>
      )}

      {/* Gallery */}
      {myVictories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Nenhuma vitória registrada ainda.</p>
          <p className="text-gray-600 text-xs mt-1">Tire sua primeira foto!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {myVictories.map((v, i) => (
            <VictoryCard
              key={v.id}
              victory={v}
              index={i}
              onDelete={deleteVictory}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && selectedFilter && (
          <CameraCapture
            onCapture={handleCapture}
            onClose={() => setShowCamera(false)}
            filterType={selectedFilter}
          />
        )}
      </AnimatePresence>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full max-h-[90vh]"
            >
              <img
                src={preview.imageData}
                alt="Vitória"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleDownload(preview)}
                  className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 rounded-xl px-4 py-2">
                <p className="text-white text-sm font-medium">{preview.userName}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(preview.capturedAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
