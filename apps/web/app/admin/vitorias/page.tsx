"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Trophy,
  Shield,
  Search,
  X,
  Download,
  Trash2,
  Eye,
  Calendar,
  Instagram,
  Share2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useVictories, type VictoryPhoto } from "@/stores/victories";
import CameraCapture from "@/components/victory/CameraCapture";
import VictoryCard from "@/components/victory/VictoryCard";

export default function AdminVitoriasPage() {
  const { user } = useAuth();
  const { victories, hydrate, addVictory, deleteVictory } = useVictories();
  const [showCamera, setShowCamera] = useState(false);
  const [preview, setPreview] = useState<VictoryPhoto | null>(null);
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const myVictories = user ? victories.filter((v) => v.userId === user.id) : [];

  const allVictories = search
    ? victories.filter((v) => v.userName.toLowerCase().includes(search.toLowerCase()))
    : victories;

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
    link.download = `vitoria-${v.userName.replace(/\s/g, "-")}-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-orange-500" />
            Vitórias
          </h1>
          <p className="text-gray-400 text-sm mt-1">{victories.length} fotos registradas no total</p>
        </div>
        <button
          onClick={() => setShowCamera(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
        >
          <Camera className="w-4 h-4" />
          Registrar Minha Vitória
        </button>
      </div>

      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm text-red-400">
          Espaço insuficiente. Delete fotos antigas para continuar.
        </div>
      )}

      {/* My Victories */}
      {myVictories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4">Minhas Vitórias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
        </div>
      )}

      {/* Security Control Panel */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold">Controle de Segurança</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
              {victories.length} fotos
            </span>
          </div>
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuário..."
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 w-full sm:w-56"
            />
          </div>
        </div>

        {allVictories.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {search ? "Nenhuma foto encontrada" : "Nenhuma foto registrada ainda"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {allVictories.map((v) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#141415] rounded-2xl border border-white/[0.06] p-3 flex gap-3"
                >
                  <div
                    className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => setPreview(v)}
                  >
                    <img src={v.imageData} alt="Vitória" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold">
                        {v.userAvatar}
                      </div>
                      <span className="text-sm font-medium truncate">{v.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(v.capturedAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreview(v)}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(v)}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteVictory(v.id)}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allVictories.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-[#141415] rounded-2xl border border-white/[0.06] overflow-hidden group"
                >
                  <div
                    className="aspect-[9/16] max-h-[260px] cursor-pointer overflow-hidden relative"
                    onClick={() => setPreview(v)}
                  >
                    <img
                      src={v.imageData}
                      alt="Vitória"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Hover overlay actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreview(v); }}
                        className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(v); }}
                        className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteVictory(v.id); }}
                        className="p-2 rounded-xl bg-black/60 text-white hover:bg-red-500/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[9px] font-bold">
                        {v.userAvatar}
                      </div>
                      <span className="text-xs font-medium truncate">{v.userName}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {new Date(v.capturedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

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
              className="relative max-w-lg w-full max-h-[90vh]"
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
                  onClick={() => { deleteVictory(preview.id); setPreview(null); }}
                  className="p-2 rounded-xl bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
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
