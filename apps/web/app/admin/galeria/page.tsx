"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Trash2,
  Download,
  Image as ImageIcon,
  Eye,
  Calendar,
  Search,
} from "lucide-react";

interface GalleryImage {
  id: string;
  name: string;
  data: string; // base64
  uploadedAt: string;
  size: number; // bytes
}

const STORAGE_KEY = "planopace_gallery";

function loadImages(): GalleryImage[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
}

function saveImages(images: GalleryImage[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [preview, setPreview] = useState<GalleryImage | null>(null);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(loadImages());
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages: GalleryImage[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img: GalleryImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          data: reader.result as string,
          uploadedAt: new Date().toISOString(),
          size: file.size,
        };
        setImages((prev) => {
          const updated = [img, ...prev];
          saveImages(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    saveImages(updated);
    setImages(updated);
    if (preview?.id === id) setPreview(null);
  };

  const handleDownload = (img: GalleryImage) => {
    const link = document.createElement("a");
    link.href = img.data;
    link.download = img.name;
    link.click();
  };

  const filteredImages = search
    ? images.filter((img) => img.name.toLowerCase().includes(search.toLowerCase()))
    : images;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold">Galeria</h1>
          <p className="text-gray-400 text-sm mt-1">{images.length} {images.length === 1 ? "imagem" : "imagens"} salvas</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 w-full sm:w-48"
            />
          </div>
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-8 mb-8 text-center transition-all ${
          dragOver
            ? "border-orange-500 bg-orange-500/5"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">
          Arraste imagens aqui ou{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            clique para fazer upload
          </button>
        </p>
        <p className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP</p>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {search ? "Nenhuma imagem encontrada" : "Nenhuma imagem salva ainda"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredImages.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-[#141415] rounded-xl border border-white/[0.06] overflow-hidden"
            >
              <div
                className="aspect-video cursor-pointer"
                onClick={() => setPreview(img)}
              >
                <img
                  src={img.data}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setPreview(img)}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDownload(img)}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-red-500/80 text-white transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-white font-medium truncate">{img.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-500">{formatFileSize(img.size)}</span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(img.uploadedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] w-full"
            >
              <img
                src={preview.data}
                alt={preview.name}
                className="w-full h-full object-contain rounded-xl"
              />

              {/* Top bar */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => handleDownload(preview)}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { handleDelete(preview.id); setPreview(null); }}
                  className="p-2 rounded-xl bg-black/60 hover:bg-red-500/80 text-white transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-4 left-4 bg-black/60 rounded-xl px-4 py-2">
                <p className="text-white text-sm font-medium">{preview.name}</p>
                <p className="text-gray-400 text-xs">
                  {formatFileSize(preview.size)} &middot; {new Date(preview.uploadedAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
