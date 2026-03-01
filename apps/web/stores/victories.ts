import { create } from "zustand";

export interface VictoryPhoto {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageData: string; // base64 JPEG
  capturedAt: string;
  caption?: string;
}

const STORAGE_KEY = "planopace_victories";

function loadVictories(): VictoryPhoto[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
}

function saveVictories(victories: VictoryPhoto[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(victories));
    } catch {
      // QuotaExceededError - storage full
    }
  }
}

interface VictoryState {
  victories: VictoryPhoto[];
  hydrate: () => void;
  addVictory: (photo: Omit<VictoryPhoto, "id" | "capturedAt">) => boolean;
  deleteVictory: (id: string) => void;
  getVictoriesByUser: (userId: string) => VictoryPhoto[];
}

export const useVictories = create<VictoryState>((set, get) => ({
  victories: [],

  hydrate: () => {
    set({ victories: loadVictories() });
  },

  addVictory: (photo) => {
    const newVictory: VictoryPhoto = {
      ...photo,
      id: `victory-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      capturedAt: new Date().toISOString(),
    };
    const victories = [newVictory, ...get().victories];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(victories));
      set({ victories });
      return true;
    } catch {
      return false;
    }
  },

  deleteVictory: (id) => {
    const victories = get().victories.filter((v) => v.id !== id);
    saveVictories(victories);
    set({ victories });
  },

  getVictoriesByUser: (userId) => {
    return get().victories.filter((v) => v.userId === userId);
  },
}));
