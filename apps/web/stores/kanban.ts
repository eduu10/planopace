import { create } from "zustand";

export type KanbanStatus = "ideias" | "esperando" | "executando" | "pausado" | "conferir" | "finalizado";

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: KanbanStatus;
  assignedTo: string; // admin id
  createdBy: string; // admin id
  pauseReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  taskId: string;
  fromUser: string;
  toUser: string;
  read: boolean;
  createdAt: string;
}

// ── Cloud sync via API proxy (avoids CORS issues with jsonblob.com) ──
const BLOB_URL = "/api/kanban";

// Local cache key for notification read states only
const LOCAL_READ_KEY = "planopace_notif_read";

const admins = [
  { id: "admin-1", name: "Admin PlanoPace" },
  { id: "admin-2", name: "Salim" },
  { id: "admin-3", name: "Camila" },
];

function getAdminName(id: string) {
  return admins.find((a) => a.id === id)?.name || id;
}

/** Always use Brasilia time (UTC-3) for consistent timestamps across all users */
function nowBrasilia(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).replace(" ", "T");
}

// ── Seed data ──
const SEED_TASKS: KanbanTask[] = [
  {
    id: "task-seed-1",
    title: "Criar sistema de pagamentos",
    description: "Integrar Stripe para cobranca recorrente",
    status: "esperando",
    assignedTo: "admin-1",
    createdBy: "admin-2",
    createdAt: "2026-02-27T08:00:00",
    updatedAt: "2026-02-27T08:00:00",
  },
  {
    id: "task-seed-2",
    title: "Videos",
    description: "2 videos de 30segundos por semana 8 por mes",
    status: "esperando",
    assignedTo: "admin-2",
    createdBy: "admin-3",
    createdAt: "2026-03-01T09:00:00",
    updatedAt: "2026-03-01T09:00:00",
  },
  {
    id: "task-seed-3",
    title: "Conta MKT de afiliados",
    description: "",
    status: "executando",
    assignedTo: "admin-3",
    createdBy: "admin-3",
    createdAt: "2026-03-01T08:00:00",
    updatedAt: "2026-03-01T08:00:00",
  },
  {
    id: "task-seed-4",
    title: "Gerenciar redes sociais",
    description: "",
    status: "executando",
    assignedTo: "admin-3",
    createdBy: "admin-3",
    createdAt: "2026-03-01T08:30:00",
    updatedAt: "2026-03-01T08:30:00",
  },
  {
    id: "task-seed-5",
    title: "Configurar integracao Strava",
    description: "Implementar OAuth e sync de atividades",
    status: "executando",
    assignedTo: "admin-2",
    createdBy: "admin-1",
    createdAt: "2026-02-26T10:00:00",
    updatedAt: "2026-02-26T10:00:00",
  },
  {
    id: "task-seed-6",
    title: "IMG _ redes sociais",
    description: "30 stories 30 feed",
    status: "executando",
    assignedTo: "admin-2",
    createdBy: "admin-3",
    createdAt: "2026-03-01T09:00:00",
    updatedAt: "2026-03-01T09:00:00",
  },
  {
    id: "task-seed-7",
    title: "Design das camisas",
    description: "Finalizar mockup frente e costas",
    status: "pausado",
    assignedTo: "admin-3",
    createdBy: "admin-2",
    pauseReason: "Aguardando aprovacao do fornecedor",
    createdAt: "2026-02-24T16:00:00",
    updatedAt: "2026-02-26T11:00:00",
  },
  {
    id: "task-seed-8",
    title: "Facebook",
    description: "criar pagina",
    status: "pausado",
    assignedTo: "admin-3",
    createdBy: "admin-3",
    pauseReason: "nome nao aceita + bloqueio de tentativas",
    createdAt: "2026-03-01T10:00:00",
    updatedAt: "2026-03-01T10:00:00",
  },
  {
    id: "task-seed-9",
    title: "Revisar landing page mobile",
    description: "Testar responsividade em diferentes dispositivos",
    status: "conferir",
    assignedTo: "admin-3",
    createdBy: "admin-1",
    createdAt: "2026-02-25T14:00:00",
    updatedAt: "2026-02-27T09:00:00",
  },
  {
    id: "task-seed-10",
    title: "Perfis _ Redes Sociais",
    description: "Facebook _ e-mail + senha Instagram _ login com facebook...",
    status: "finalizado",
    assignedTo: "admin-3",
    createdBy: "admin-3",
    createdAt: "2026-03-01T07:00:00",
    updatedAt: "2026-03-01T10:00:00",
  },
  {
    id: "task-seed-11",
    title: "Documentar API endpoints",
    description: "Swagger para todos os endpoints do NestJS",
    status: "finalizado",
    assignedTo: "admin-2",
    createdBy: "admin-1",
    createdAt: "2026-02-20T09:00:00",
    updatedAt: "2026-02-25T17:00:00",
  },
];

// ── Cloud API ──

interface CloudData {
  tasks: KanbanTask[];
  notifications: Notification[];
  initialized?: boolean;
}

async function fetchCloud(): Promise<CloudData | null> {
  try {
    const res = await fetch(BLOB_URL, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function saveCloud(data: CloudData): Promise<boolean> {
  try {
    const res = await fetch(BLOB_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) lastWriteTs = Date.now();
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Atomic cloud operation: fetch latest → apply transform → save.
 * This is the ONLY way to modify cloud data, ensuring we never lose other users' changes.
 */
async function atomicCloudUpdate(
  transform: (current: CloudData) => CloudData
): Promise<CloudData | null> {
  const cloud = await fetchCloud();
  if (!cloud) return null;
  const updated = transform(cloud);
  const ok = await saveCloud(updated);
  return ok ? updated : null;
}

// ── Local read state (only for notification read markers) ──

function getLocalReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(LOCAL_READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveLocalReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_READ_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

function applyLocalReadState(notifs: Notification[]): Notification[] {
  const readIds = getLocalReadIds();
  return notifs.map((n) => readIds.has(n.id) ? { ...n, read: true } : n);
}

// ── Polling ──
let pollInterval: ReturnType<typeof setInterval> | null = null;
const POLL_MS = 5000;
let busy = false; // prevents refresh during an ongoing save
let lastWriteTs = 0; // timestamp of last cloud write
const WRITE_COOLDOWN_MS = 6000; // ignore polls for this long after a write

// ── Store ──

interface KanbanState {
  tasks: KanbanTask[];
  notifications: Notification[];
  syncing: boolean;
  hydrate: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  refresh: () => Promise<void>;
  addTask: (task: Omit<KanbanTask, "id" | "createdAt" | "updatedAt">, currentUserId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: KanbanStatus, currentUserId: string, pauseReason?: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<KanbanTask>, currentUserId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  markNotifRead: (notifId: string) => void;
  markAllNotifsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
}

export const useKanban = create<KanbanState>((set, get) => ({
  tasks: [],
  notifications: [],
  syncing: false,

  hydrate: async () => {
    set({ syncing: true });
    const cloud = await fetchCloud();

    if (cloud && (cloud.initialized || (cloud.tasks && cloud.tasks.length > 0))) {
      // Cloud is the source of truth
      if (!cloud.initialized) {
        // Migrate legacy blob
        await saveCloud({ ...cloud, initialized: true });
      }
      set({
        tasks: cloud.tasks || [],
        notifications: applyLocalReadState(cloud.notifications || []),
        syncing: false,
      });
    } else if (!cloud) {
      // Cloud unreachable — show empty state, will sync on next poll
      set({ tasks: [], notifications: [], syncing: false });
    } else {
      // First time — seed
      const data: CloudData = { tasks: SEED_TASKS, notifications: [], initialized: true };
      await saveCloud(data);
      set({ tasks: SEED_TASKS, notifications: [], syncing: false });
    }
  },

  startPolling: () => {
    if (pollInterval) return;
    pollInterval = setInterval(() => { get().refresh(); }, POLL_MS);
  },

  stopPolling: () => {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  },

  refresh: async () => {
    if (busy) return;
    // Skip poll if a write happened recently (cloud may not have propagated yet)
    if (Date.now() - lastWriteTs < WRITE_COOLDOWN_MS) return;
    const cloud = await fetchCloud();
    if (!cloud || !cloud.tasks) return;
    set({
      tasks: cloud.tasks,
      notifications: applyLocalReadState(cloud.notifications || []),
    });
  },

  addTask: async (task, currentUserId) => {
    busy = true;
    const now = nowBrasilia();
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newTask: KanbanTask = {
      ...task,
      id: `task-${uid}`,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic update
    set({ tasks: [...get().tasks, newTask] });

    const result = await atomicCloudUpdate((cloud) => {
      const newNotifs: Notification[] = admins
        .filter((a) => a.id !== currentUserId)
        .map((a, i) => ({
          id: `notif-${uid}-${i}`,
          message: `${getAdminName(currentUserId)} criou a tarefa "${newTask.title}"`,
          taskId: newTask.id,
          fromUser: currentUserId,
          toUser: a.id,
          read: false,
          createdAt: now,
        }));
      return {
        ...cloud,
        tasks: [...cloud.tasks, newTask],
        notifications: [...(cloud.notifications || []), ...newNotifs],
        initialized: true,
      };
    });

    if (result) {
      set({ tasks: result.tasks, notifications: applyLocalReadState(result.notifications) });
    } else {
      // Revert optimistic update on failure
      const cloud = await fetchCloud();
      if (cloud?.tasks) set({ tasks: cloud.tasks, notifications: applyLocalReadState(cloud.notifications || []) });
    }
    busy = false;
  },

  moveTask: async (taskId, newStatus, currentUserId, pauseReason) => {
    busy = true;
    const now = nowBrasilia();

    // Optimistic update
    const optimistic = get().tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: now, pauseReason: newStatus === "pausado" ? pauseReason : undefined } : t
    );
    set({ tasks: optimistic });

    const statusLabels: Record<KanbanStatus, string> = {
      ideias: "Ideias", esperando: "Esperando", executando: "Executando",
      pausado: "Pausado", conferir: "Conferir", finalizado: "Finalizado",
    };

    const result = await atomicCloudUpdate((cloud) => {
      const tasks = cloud.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, updatedAt: now, pauseReason: newStatus === "pausado" ? pauseReason : undefined } : t
      );
      const task = tasks.find((t) => t.id === taskId);
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newNotifs: Notification[] = admins
        .filter((a) => a.id !== currentUserId)
        .map((a, i) => ({
          id: `notif-${uid}-${i}`,
          message: `${getAdminName(currentUserId)} moveu "${task?.title}" para ${statusLabels[newStatus]}${newStatus === "pausado" && pauseReason ? ` (${pauseReason})` : ""}`,
          taskId,
          fromUser: currentUserId,
          toUser: a.id,
          read: false,
          createdAt: now,
        }));
      return {
        ...cloud,
        tasks,
        notifications: [...(cloud.notifications || []), ...newNotifs],
        initialized: true,
      };
    });

    if (result) {
      set({ tasks: result.tasks, notifications: applyLocalReadState(result.notifications) });
    } else {
      const cloud = await fetchCloud();
      if (cloud?.tasks) set({ tasks: cloud.tasks, notifications: applyLocalReadState(cloud.notifications || []) });
    }
    busy = false;
  },

  updateTask: async (taskId, updates, currentUserId) => {
    busy = true;
    const now = nowBrasilia();

    // Optimistic
    set({ tasks: get().tasks.map((t) => t.id === taskId ? { ...t, ...updates, updatedAt: now } : t) });

    const result = await atomicCloudUpdate((cloud) => {
      const tasks = cloud.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
      );
      const task = tasks.find((t) => t.id === taskId);
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newNotifs: Notification[] = admins
        .filter((a) => a.id !== currentUserId)
        .map((a, i) => ({
          id: `notif-${uid}-${i}`,
          message: `${getAdminName(currentUserId)} atualizou a tarefa "${task?.title}"`,
          taskId,
          fromUser: currentUserId,
          toUser: a.id,
          read: false,
          createdAt: now,
        }));
      return {
        ...cloud,
        tasks,
        notifications: [...(cloud.notifications || []), ...newNotifs],
        initialized: true,
      };
    });

    if (result) {
      set({ tasks: result.tasks, notifications: applyLocalReadState(result.notifications) });
    } else {
      const cloud = await fetchCloud();
      if (cloud?.tasks) set({ tasks: cloud.tasks, notifications: applyLocalReadState(cloud.notifications || []) });
    }
    busy = false;
  },

  deleteTask: async (taskId) => {
    busy = true;

    // Optimistic
    set({ tasks: get().tasks.filter((t) => t.id !== taskId) });

    const result = await atomicCloudUpdate((cloud) => ({
      ...cloud,
      tasks: cloud.tasks.filter((t) => t.id !== taskId),
      initialized: true,
    }));

    if (result) {
      set({ tasks: result.tasks, notifications: applyLocalReadState(result.notifications) });
    } else {
      const cloud = await fetchCloud();
      if (cloud?.tasks) set({ tasks: cloud.tasks, notifications: applyLocalReadState(cloud.notifications || []) });
    }
    busy = false;
  },

  markNotifRead: (notifId) => {
    const readIds = getLocalReadIds();
    readIds.add(notifId);
    saveLocalReadIds(readIds);
    set({
      notifications: get().notifications.map((n) => n.id === notifId ? { ...n, read: true } : n),
    });
  },

  markAllNotifsRead: (userId) => {
    const readIds = getLocalReadIds();
    get().notifications.forEach((n) => {
      if (n.toUser === userId) readIds.add(n.id);
    });
    saveLocalReadIds(readIds);
    set({
      notifications: get().notifications.map((n) => n.toUser === userId ? { ...n, read: true } : n),
    });
  },

  getUnreadCount: (userId) => {
    return get().notifications.filter((n) => n.toUser === userId && !n.read).length;
  },
}));

export const ADMIN_LIST = admins;
