import { create } from "zustand";

export type UserRole = "admin" | "user";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  plan: "Mensal" | "Semestral" | "Anual";
  avatar: string;
  age: number;
  weight: number;
  pace: string;
  vdot: number;
  goal: string;
  daysPerWeek: number;
  strava: boolean;
}

// Banco de dados de usuários
export const USERS_DB: AppUser[] = [
  {
    id: "admin-1",
    name: "Admin PlanoPace",
    email: "admin@planopace.com",
    password: "x12661266x",
    role: "admin",
    plan: "Anual",
    avatar: "A",
    age: 30,
    weight: 72,
    pace: "4:30",
    vdot: 52,
    goal: "Gerenciar plataforma",
    daysPerWeek: 5,
    strava: true,
  },
  {
    id: "admin-2",
    name: "Salim",
    email: "salim@planopace.com",
    password: "mud@123778",
    role: "admin",
    plan: "Anual",
    avatar: "S",
    age: 29,
    weight: 78,
    pace: "4:45",
    vdot: 48,
    goal: "Gerenciar plataforma",
    daysPerWeek: 5,
    strava: true,
  },
  {
    id: "admin-3",
    name: "Camila",
    email: "camila@planopace.com",
    password: "mud@123887",
    role: "admin",
    plan: "Anual",
    avatar: "C",
    age: 27,
    weight: 60,
    pace: "5:10",
    vdot: 42,
    goal: "Gerenciar plataforma",
    daysPerWeek: 4,
    strava: true,
  },
  {
    id: "user-1",
    name: "João Silva",
    email: "joao@email.com",
    password: "joao1234",
    role: "user",
    plan: "Semestral",
    avatar: "J",
    age: 32,
    weight: 75,
    pace: "5:48",
    vdot: 38,
    goal: "10k sub-50min",
    daysPerWeek: 4,
    strava: true,
  },
  {
    id: "user-2",
    name: "Maria Santos",
    email: "maria@email.com",
    password: "maria1234",
    role: "user",
    plan: "Mensal",
    avatar: "M",
    age: 28,
    weight: 58,
    pace: "6:15",
    vdot: 34,
    goal: "Completar 5K",
    daysPerWeek: 3,
    strava: false,
  },
  {
    id: "user-3",
    name: "Carlos Mendes",
    email: "carlos@email.com",
    password: "carlos1234",
    role: "user",
    plan: "Anual",
    avatar: "C",
    age: 40,
    weight: 70,
    pace: "4:55",
    vdot: 45,
    goal: "Maratona sub-3:30",
    daysPerWeek: 6,
    strava: true,
  },
];

interface AuthState {
  user: AppUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAdmin: () => boolean;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,

  login: (email: string, password: string) => {
    const found = USERS_DB.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, error: "Email ou senha incorretos." };
    }
    // Salva no localStorage (sem a senha)
    const safeUser = { ...found };
    if (typeof window !== "undefined") {
      localStorage.setItem("planopace_user", JSON.stringify(safeUser));
    }
    set({ user: safeUser });
    return { success: true };
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("planopace_user");
    }
    set({ user: null });
  },

  isAdmin: () => {
    return get().user?.role === "admin";
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("planopace_user");
      if (stored) {
        try {
          set({ user: JSON.parse(stored) });
        } catch {
          localStorage.removeItem("planopace_user");
        }
      }
    }
  },
}));
