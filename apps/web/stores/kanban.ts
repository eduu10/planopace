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

const STORAGE_KEY = "planopace_kanban";
const NOTIF_KEY = "planopace_notifications";
const SEED_VERSION_KEY = "planopace_kanban_seed_v";
const CURRENT_SEED_VERSION = "4"; // bump this to force re-seed for all users

const admins = [
  { id: "admin-1", name: "Admin PlanoPace" },
  { id: "admin-2", name: "Salim" },
  { id: "admin-3", name: "Camila" },
];

function getAdminName(id: string) {
  return admins.find((a) => a.id === id)?.name || id;
}

function loadTasks(): KanbanTask[] {
  if (typeof window === "undefined") return [];
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
  // If seed version matches, use stored data
  if (storedVersion === CURRENT_SEED_VERSION) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fall through to re-seed */ }
    }
  }
  // Re-seed: version mismatch or first load
  localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
  // Seed initial tasks — all tasks from all admins, shared across everyone
  const initial: KanbanTask[] = [
    // === Esperando ===
    {
      id: "task-seed-1",
      title: "Criar sistema de pagamentos",
      description: "Integrar Stripe para cobrança recorrente",
      status: "esperando",
      assignedTo: "admin-1",
      createdBy: "admin-2",
      createdAt: "2026-02-27T08:00:00",
      updatedAt: "2026-02-27T08:00:00",
    },
    {
      id: "task-seed-2",
      title: "Vídeos",
      description: "2 vídeos de 30segundos por semana 8 por mês",
      status: "esperando",
      assignedTo: "admin-2",
      createdBy: "admin-3",
      createdAt: "2026-03-01T09:00:00",
      updatedAt: "2026-03-01T09:00:00",
    },
    // === Executando ===
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
      title: "Configurar integração Strava",
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
    // === Pausado ===
    {
      id: "task-seed-7",
      title: "Design das camisas",
      description: "Finalizar mockup frente e costas",
      status: "pausado",
      assignedTo: "admin-3",
      createdBy: "admin-2",
      pauseReason: "Aguardando aprovação do fornecedor",
      createdAt: "2026-02-24T16:00:00",
      updatedAt: "2026-02-26T11:00:00",
    },
    {
      id: "task-seed-8",
      title: "Facebook",
      description: "criar página",
      status: "pausado",
      assignedTo: "admin-3",
      createdBy: "admin-3",
      pauseReason: "nome não aceita + bloqueio de tentativas",
      createdAt: "2026-03-01T10:00:00",
      updatedAt: "2026-03-01T10:00:00",
    },
    // === Conferir ===
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
    // === Finalizado ===
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(NOTIF_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
}

function saveTasks(tasks: KanbanTask[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}

function saveNotifications(notifs: Notification[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  }
}

interface KanbanState {
  tasks: KanbanTask[];
  notifications: Notification[];
  hydrate: () => void;
  addTask: (task: Omit<KanbanTask, "id" | "createdAt" | "updatedAt">, currentUserId: string) => void;
  moveTask: (taskId: string, newStatus: KanbanStatus, currentUserId: string, pauseReason?: string) => void;
  updateTask: (taskId: string, updates: Partial<KanbanTask>, currentUserId: string) => void;
  deleteTask: (taskId: string) => void;
  markNotifRead: (notifId: string) => void;
  markAllNotifsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
}

export const useKanban = create<KanbanState>((set, get) => ({
  tasks: [],
  notifications: [],

  hydrate: () => {
    set({ tasks: loadTasks(), notifications: loadNotifications() });
  },

  addTask: (task, currentUserId) => {
    const now = new Date().toISOString();
    const newTask: KanbanTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const tasks = [...get().tasks, newTask];
    saveTasks(tasks);

    // Notify other admins
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
    saveNotifications(notifications);
    set({ tasks, notifications });
  },

  moveTask: (taskId, newStatus, currentUserId, pauseReason) => {
    const now = new Date().toISOString();
    const tasks = get().tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: newStatus, updatedAt: now, pauseReason: newStatus === "pausado" ? pauseReason : undefined }
        : t
    );
    saveTasks(tasks);

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
    saveNotifications(notifications);
    set({ tasks, notifications });
  },

  updateTask: (taskId, updates, currentUserId) => {
    const now = new Date().toISOString();
    const tasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
    );
    saveTasks(tasks);

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
    saveNotifications(notifications);
    set({ tasks, notifications });
  },

  deleteTask: (taskId) => {
    const tasks = get().tasks.filter((t) => t.id !== taskId);
    saveTasks(tasks);
    set({ tasks });
  },

  markNotifRead: (notifId) => {
    const notifications = get().notifications.map((n) =>
      n.id === notifId ? { ...n, read: true } : n
    );
    saveNotifications(notifications);
    set({ notifications });
  },

  markAllNotifsRead: (userId) => {
    const notifications = get().notifications.map((n) =>
      n.toUser === userId ? { ...n, read: true } : n
    );
    saveNotifications(notifications);
    set({ notifications });
  },

  getUnreadCount: (userId) => {
    return get().notifications.filter((n) => n.toUser === userId && !n.read).length;
  },
}));

export const ADMIN_LIST = admins;
