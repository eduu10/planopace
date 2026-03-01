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

// ── Cloud sync via jsonblob.com ──
const BLOB_ID = "019caa14-b7dd-7ce9-878a-df3d977593ad";
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

// Local cache keys
const LOCAL_TASKS_KEY = "planopace_kanban";
const LOCAL_NOTIF_KEY = "planopace_notifications";

const admins = [
  { id: "admin-1", name: "Admin PlanoPace" },
  { id: "admin-2", name: "Salim" },
  { id: "admin-3", name: "Camila" },
];

function getAdminName(id: string) {
  return admins.find((a) => a.id === id)?.name || id;
}

// ── Seed data (used only if cloud has no data) ──
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

// ── Cloud API helpers ──

interface CloudData {
  tasks: KanbanTask[];
  notifications: Notification[];
}

async function fetchCloud(): Promise<CloudData | null> {
  try {
    const res = await fetch(BLOB_URL, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
    return res.ok;
  } catch {
    return false;
  }
}

// ── Local cache helpers (fallback when offline) ──

function cacheLocally(data: CloudData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(data.tasks));
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(data.notifications));
  } catch { /* quota exceeded, ignore */ }
}

function loadLocalCache(): CloudData {
  if (typeof window === "undefined") return { tasks: [], notifications: [] };
  try {
    const tasks = JSON.parse(localStorage.getItem(LOCAL_TASKS_KEY) || "[]");
    const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIF_KEY) || "[]");
    return { tasks, notifications: notifs };
  } catch {
    return { tasks: [], notifications: [] };
  }
}

// ── Polling interval ──
let pollInterval: ReturnType<typeof setInterval> | null = null;
const POLL_MS = 5000; // 5 seconds

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
    // Try cloud first
    const cloud = await fetchCloud();
    if (cloud && cloud.tasks && cloud.tasks.length > 0) {
      cacheLocally(cloud);
      // Merge: cloud tasks + local-only notifications (read state is per-user)
      const localNotifs = loadLocalCache().notifications;
      // Merge notifications: cloud has shared notifs, local has read states
      const mergedNotifs = mergeNotifications(cloud.notifications || [], localNotifs);
      set({ tasks: cloud.tasks, notifications: mergedNotifs, syncing: false });
    } else {
      // Cloud empty or unreachable — use local cache or seed
      const local = loadLocalCache();
      if (local.tasks.length > 0) {
        set({ tasks: local.tasks, notifications: local.notifications, syncing: false });
        // Try to push local data to cloud
        await saveCloud({ tasks: local.tasks, notifications: local.notifications });
      } else {
        // First time ever — seed
        const data: CloudData = { tasks: SEED_TASKS, notifications: [] };
        await saveCloud(data);
        cacheLocally(data);
        set({ tasks: SEED_TASKS, notifications: [], syncing: false });
      }
    }
  },

  startPolling: () => {
    if (pollInterval) return;
    pollInterval = setInterval(() => {
      get().refresh();
    }, POLL_MS);
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  },

  refresh: async () => {
    const cloud = await fetchCloud();
    if (!cloud || !cloud.tasks) return;
    const localNotifs = get().notifications;
    const mergedNotifs = mergeNotifications(cloud.notifications || [], localNotifs);
    cacheLocally({ tasks: cloud.tasks, notifications: mergedNotifs });
    set({ tasks: cloud.tasks, notifications: mergedNotifs });
  },

  addTask: async (task, currentUserId) => {
    const now = new Date().toISOString();
    const newTask: KanbanTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const tasks = [...get().tasks, newTask];

    // Create notifications for other admins
    const newNotifs: Notification[] = [];
    admins.forEach((admin) => {
      if (admin.id !== currentUserId) {
        newNotifs.push({
          id: `notif-${Date.now()}-${admin.id}`,
          message: `${getAdminName(currentUserId)} criou a tarefa "${newTask.title}"`,
          taskId: newTask.id,
          fromUser: currentUserId,
          toUser: admin.id,
          read: false,
          createdAt: now,
        });
      }
    });
    const notifications = [...get().notifications, ...newNotifs];

    // Update state immediately (optimistic)
    set({ tasks, notifications });
    cacheLocally({ tasks, notifications });

    // Sync to cloud
    await saveCloud({ tasks, notifications });
  },

  moveTask: async (taskId, newStatus, currentUserId, pauseReason) => {
    const now = new Date().toISOString();
    const tasks = get().tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: newStatus, updatedAt: now, pauseReason: newStatus === "pausado" ? pauseReason : undefined }
        : t
    );

    const task = tasks.find((t) => t.id === taskId);
    const statusLabels: Record<KanbanStatus, string> = {
      ideias: "Ideias",
      esperando: "Esperando",
      executando: "Executando",
      pausado: "Pausado",
      conferir: "Conferir",
      finalizado: "Finalizado",
    };

    const newNotifs: Notification[] = [];
    admins.forEach((admin) => {
      if (admin.id !== currentUserId) {
        newNotifs.push({
          id: `notif-${Date.now()}-${admin.id}`,
          message: `${getAdminName(currentUserId)} moveu "${task?.title}" para ${statusLabels[newStatus]}${newStatus === "pausado" && pauseReason ? ` (${pauseReason})` : ""}`,
          taskId,
          fromUser: currentUserId,
          toUser: admin.id,
          read: false,
          createdAt: now,
        });
      }
    });
    const notifications = [...get().notifications, ...newNotifs];

    set({ tasks, notifications });
    cacheLocally({ tasks, notifications });
    await saveCloud({ tasks, notifications });
  },

  updateTask: async (taskId, updates, currentUserId) => {
    const now = new Date().toISOString();
    const tasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
    );

    const task = tasks.find((t) => t.id === taskId);
    const newNotifs: Notification[] = [];
    admins.forEach((admin) => {
      if (admin.id !== currentUserId) {
        newNotifs.push({
          id: `notif-${Date.now()}-${admin.id}`,
          message: `${getAdminName(currentUserId)} atualizou a tarefa "${task?.title}"`,
          taskId,
          fromUser: currentUserId,
          toUser: admin.id,
          read: false,
          createdAt: now,
        });
      }
    });
    const notifications = [...get().notifications, ...newNotifs];

    set({ tasks, notifications });
    cacheLocally({ tasks, notifications });
    await saveCloud({ tasks, notifications });
  },

  deleteTask: async (taskId) => {
    const tasks = get().tasks.filter((t) => t.id !== taskId);
    const notifications = get().notifications;

    set({ tasks });
    cacheLocally({ tasks, notifications });
    await saveCloud({ tasks, notifications });
  },

  markNotifRead: (notifId) => {
    const notifications = get().notifications.map((n) =>
      n.id === notifId ? { ...n, read: true } : n
    );
    // Read state is local-only (each user manages their own)
    set({ notifications });
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(notifications));
    }
  },

  markAllNotifsRead: (userId) => {
    const notifications = get().notifications.map((n) =>
      n.toUser === userId ? { ...n, read: true } : n
    );
    set({ notifications });
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(notifications));
    }
  },

  getUnreadCount: (userId) => {
    return get().notifications.filter((n) => n.toUser === userId && !n.read).length;
  },
}));

// Merge cloud notifications with local read states
function mergeNotifications(cloudNotifs: Notification[], localNotifs: Notification[]): Notification[] {
  const localReadMap = new Map<string, boolean>();
  localNotifs.forEach((n) => {
    if (n.read) localReadMap.set(n.id, true);
  });

  // Start with cloud notifications, preserving local read states
  const merged = cloudNotifs.map((n) => ({
    ...n,
    read: localReadMap.has(n.id) ? true : n.read,
  }));

  // Add any local-only notifications not in cloud
  const cloudIds = new Set(cloudNotifs.map((n) => n.id));
  localNotifs.forEach((n) => {
    if (!cloudIds.has(n.id)) {
      merged.push(n);
    }
  });

  return merged;
}

export const ADMIN_LIST = admins;
