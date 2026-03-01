"use client";

import { motion } from "framer-motion";
import { Instagram, Share2, Trash2, Download, Calendar } from "lucide-react";
import type { VictoryPhoto } from "@/stores/victories";

interface VictoryCardProps {
  victory: VictoryPhoto;
  onDelete?: (id: string) => void;
  onPreview?: (victory: VictoryPhoto) => void;
  showUserInfo?: boolean;
  index?: number;
}

async function imageToFile(dataUri: string): Promise<File> {
  const res = await fetch(dataUri);
  const blob = await res.blob();
  return new File([blob], "vitoria-planopace.jpg", { type: "image/jpeg" });
}

async function shareToInstagram(dataUri: string) {
  try {
    const file = await imageToFile(dataUri);
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Minha Vitória - PlanoPace" });
      return;
    }
  } catch {
    // user cancelled
  }
  // Fallback: download
  const link = document.createElement("a");
  link.href = dataUri;
  link.download = "vitoria-planopace.jpg";
  link.click();
}

async function shareGeneral(dataUri: string) {
  try {
    const file = await imageToFile(dataUri);
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Registrei minha vitória!",
        text: "Completei meu treino com o PlanoPace! #PlanoPace #Corrida",
      });
      return;
    }
  } catch {
    // user cancelled
  }
  // Fallback: download
  const link = document.createElement("a");
  link.href = dataUri;
  link.download = "vitoria-planopace.jpg";
  link.click();
}

export default function VictoryCard({ victory, onDelete, onPreview, showUserInfo, index = 0 }: VictoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden group"
    >
      {/* Image */}
      <div
        className="aspect-[9/16] max-h-[300px] cursor-pointer overflow-hidden"
        onClick={() => onPreview?.(victory)}
      >
        <img
          src={victory.imageData}
          alt="Vitória"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        {showUserInfo && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
              {victory.userAvatar}
            </div>
            <span className="text-xs font-medium text-white">{victory.userName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
          <Calendar className="w-3 h-3" />
          {new Date(victory.capturedAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {victory.caption && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{victory.caption}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => shareToInstagram(victory.imageData)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-3.5 h-3.5" />
            Stories
          </button>
          <button
            onClick={() => shareGeneral(victory.imageData)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartilhar
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(victory.id)}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function VictoryDownloadButton({ imageData }: { imageData: string }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `vitoria-planopace-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <button
      onClick={handleDownload}
      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
    </button>
  );
}
