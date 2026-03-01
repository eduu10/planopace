"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Trophy, X, Download } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useVictories, type VictoryPhoto } from "@/stores/victories";
import CameraCapture from "@/components/victory/CameraCapture";
import VictoryCard from "@/components/victory/VictoryCard";

export default function VitoriasPage() {
  const { user } = useAuth();
  const { victories, hydrate, addVictory, deleteVictory } = useVictories();
  const [showCamera, setShowCamera] = useState(false);
  const [preview, setPreview] = useState<VictoryPhoto | null>(null);
  const [saveError, setSaveError] = useState(false);

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

  const handleDownload = (v: VictoryPhoto) => {
    const link = document.createElement("a");
    link.href = v.imageData;
    link.download = `vitoria-planopace-${Date.now()}.jpg`;
    link.click();
  };

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

      {/* Capture Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowCamera(true)}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-5 flex items-center justify-center gap-3 font-bold text-lg mb-6 active:scale-[0.98] transition-transform"
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
        {showCamera && (
          <CameraCapture
            onCapture={handleCapture}
            onClose={() => setShowCamera(false)}
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
