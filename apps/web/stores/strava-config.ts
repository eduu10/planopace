import { create } from "zustand";

export interface StravaConfig {
  clientId: string;
  clientSecret: string;
  callbackDomain: string;
  webhookVerifyToken: string;
  scopes: string[];
  isConnected: boolean;
  lastSyncAt: string | null;
}

interface StravaConfigState {
  config: StravaConfig;
  isSaving: boolean;
  save: (config: Partial<StravaConfig>) => void;
  hydrate: () => void;
  testConnection: () => Promise<boolean>;
  getCallbackUrl: () => string;
  getAuthorizationUrl: () => string;
}

const DEFAULT_SCOPES = ["read", "activity:read_all"];

const DEFAULT_CONFIG: StravaConfig = {
  clientId: "",
  clientSecret: "",
  callbackDomain: "http://localhost:3000",
  webhookVerifyToken: "",
  scopes: DEFAULT_SCOPES,
  isConnected: false,
  lastSyncAt: null,
};

const STORAGE_KEY = "planopace_strava_config";

export const useStravaConfig = create<StravaConfigState>((set, get) => ({
  config: { ...DEFAULT_CONFIG },
  isSaving: false,

  save: (partial) => {
    set({ isSaving: true });
    const current = get().config;
    const updated = { ...current, ...partial };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ config: updated, isSaving: false });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<StravaConfig>;
          set({ config: { ...DEFAULT_CONFIG, ...parsed } });
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  },

  testConnection: async () => {
    const { clientId, clientSecret } = get().config;
    if (!clientId || !clientSecret) return false;

    try {
      const res = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
      });
      // Strava returns 400 for client_credentials but 401 for invalid credentials
      return res.status !== 401;
    } catch {
      return false;
    }
  },

  getCallbackUrl: () => {
    const { callbackDomain } = get().config;
    const domain = callbackDomain.replace(/\/+$/, "");
    return `${domain}/auth/strava/callback`;
  },

  getAuthorizationUrl: () => {
    const { clientId, callbackDomain, scopes } = get().config;
    const redirectUri = `${callbackDomain.replace(/\/+$/, "")}/auth/strava/callback`;
    const scopeStr = scopes.join(",");
    return `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopeStr}&approval_prompt=auto`;
  },
}));
