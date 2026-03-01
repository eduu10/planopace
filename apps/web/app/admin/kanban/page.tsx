"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  Play,
  Pause,
  Eye,
  CheckCircle2,
  GripVertical,
  X,
  User,
  AlertCircle,
  Lightbulb,
  Bell,
} from "lucide-react";
import { useKanban, ADMIN_LIST, type KanbanStatus, type KanbanTask } from "@/stores/kanban";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const columns: { id: KanbanStatus; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: "ideias", label: "Ideias", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  { id: "esperando", label: "Esperando", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30" },
  { id: "executando", label: "Executando", icon: Play, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
  { id: "pausado", label: "Pausado", icon: Pause, color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  { id: "conferir", label: "Conferir", icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30" },
  { id: "finalizado", label: "Finalizado", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10 border-green-500/30" },
];

function getAdminName(id: string) {
  return ADMIN_LIST.find((a) => a.id === id)?.name || id;
}

function getAdminAvatar(id: string) {
  return ADMIN_LIST.find((a) => a.id === id)?.name[0] || "?";
}

const avatarColors: Record<string, string> = {
  "admin-1": "bg-orange-500",
  "admin-2": "bg-blue-500",
  "admin-3": "bg-purple-500",
};

export default function KanbanPage() {
  const { user } = useAuth();
  const { tasks, notifications, hydrate, addTask, moveTask, deleteTask, markNotifRead, markAllNotifsRead } = useKanban();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState<{ taskId: string } | null>(null);
  const [pauseReason, setPauseReason] = useState("");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "admin-1",
    status: "esperando" as KanbanStatus,
  });

  const unreadCount = user
    ? notifications.filter((n) => n.toUser === user.id && !n.read).length
    : 0;

  const userNotifs = user
    ? notifications.filter((n) => n.toUser === user.id).slice(-20).reverse()
    : [];

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !user) return;
    addTask(
      {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        assignedTo: newTask.assignedTo,
        createdBy: user.id,
      },
      user.id
    );
    setNewTask({ title: "", description: "", assignedTo: "admin-1", status: "esperando" });
    setShowModal(false);
  };

  const handleDrop = (status: KanbanStatus) => {
    if (!draggedTask || !user) return;
    if (status === "pausado") {
      setShowPauseModal({ taskId: draggedTask });
      setDraggedTask(null);
      setDragOverColumn(null);
      return;
    }
    moveTask(draggedTask, status, user.id);
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handlePauseConfirm = () => {
    if (!showPauseModal || !user) return;
    moveTask(showPauseModal.taskId, "pausado", user.id, pauseReason);
    setShowPauseModal(null);
    setPauseReason("");
  };

  const handleStatusClick = (task: KanbanTask, newStatus: KanbanStatus) => {
    if (!user) return;
    if (newStatus === "pausado") {
      setShowPauseModal({ taskId: task.id });
      return;
    }
    moveTask(task.id, newStatus, user.id);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kanban</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie as tarefas da equipe</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 bg-[#141415] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                    <h3 className="text-sm font-bold text-white">Notificações</h3>
                    {unreadCount > 0 && user && (
                      <button
                        onClick={() => markAllNotifsRead(user.id)}
                        className="text-xs text-orange-500 hover:text-orange-400 font-medium"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {userNotifs.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        Nenhuma notificação
                      </div>
                    ) : (
                      userNotifs.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            markNotifRead(notif.id);
                            setShowNotifs(false);
                          }}
                          className={`w-full text-left p-3 border-b border-white/[0.03] hover:bg-white/5 transition-colors ${
                            !notif.read ? "bg-orange-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                            )}
                            <div className={!notif.read ? "" : "ml-4"}>
                              <p className="text-xs text-gray-300">{notif.message}</p>
                              <p className="text-[10px] text-gray-600 mt-1">
                                {new Date(notif.createdAt).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory md:mx-0 md:px-0 md:grid md:grid-cols-3 xl:grid-cols-6 md:overflow-x-visible md:snap-none">
        {columns.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => {
              const aIsMine = a.assignedTo === user?.id ? 0 : 1;
              const bIsMine = b.assignedTo === user?.id ? 0 : 1;
              return aIsMine - bIsMine;
            });
          const isOver = dragOverColumn === col.id;
          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-[72vw] sm:w-60 md:w-auto rounded-2xl border transition-all snap-start ${
                isOver ? "border-orange-500/50 bg-orange-500/5" : "border-white/[0.06] bg-[#111112]"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(col.id);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.id);
              }}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <col.icon className={`w-4 h-4 ${col.color}`} />
                  <span className="text-sm font-bold text-white">{col.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.bg}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {colTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={() => setDraggedTask(task.id)}
                    onDragEnd={() => {
                      setDraggedTask(null);
                      setDragOverColumn(null);
                    }}
                    className={`bg-[#1A1A1B] rounded-xl p-3 border border-white/[0.06] cursor-grab active:cursor-grabbing hover:border-white/10 transition-all group ${
                      draggedTask === task.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-sm font-semibold text-white mb-1">{task.title}</h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>

                    {/* Pause Reason */}
                    {task.status === "pausado" && task.pauseReason && (
                      <div className="flex items-start gap-1.5 mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-red-400">{task.pauseReason}</span>
                      </div>
                    )}

                    {/* Assigned + Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full ${avatarColors[task.assignedTo] || "bg-gray-500"} flex items-center justify-center text-[9px] font-bold text-white`}>
                          {getAdminAvatar(task.assignedTo)}
                        </div>
                        <span className="text-[10px] text-gray-500">{getAdminName(task.assignedTo)}</span>
                      </div>

                      {/* Quick move buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== "ideias" && (
                          <button onClick={() => handleStatusClick(task, "ideias")} title="Ideias" className="p-1 rounded hover:bg-amber-400/20">
                            <Lightbulb className="w-3 h-3 text-amber-400" />
                          </button>
                        )}
                        {col.id !== "esperando" && (
                          <button onClick={() => handleStatusClick(task, "esperando")} title="Esperando" className="p-1 rounded hover:bg-yellow-500/20">
                            <Clock className="w-3 h-3 text-yellow-500" />
                          </button>
                        )}
                        {col.id !== "executando" && (
                          <button onClick={() => handleStatusClick(task, "executando")} title="Executando" className="p-1 rounded hover:bg-blue-500/20">
                            <Play className="w-3 h-3 text-blue-500" />
                          </button>
                        )}
                        {col.id !== "pausado" && (
                          <button onClick={() => handleStatusClick(task, "pausado")} title="Pausar" className="p-1 rounded hover:bg-red-500/20">
                            <Pause className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                        {col.id !== "conferir" && (
                          <button onClick={() => handleStatusClick(task, "conferir")} title="Conferir" className="p-1 rounded hover:bg-purple-500/20">
                            <Eye className="w-3 h-3 text-purple-500" />
                          </button>
                        )}
                        {col.id !== "finalizado" && (
                          <button onClick={() => handleStatusClick(task, "finalizado")} title="Finalizar" className="p-1 rounded hover:bg-green-500/20">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-600 mt-2">
                      por {getAdminName(task.createdBy)} &middot; {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141415] rounded-2xl p-6 w-full max-w-md border border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Nova Tarefa</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Título</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Nome da tarefa"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Descrição</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Detalhes da tarefa..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Responsável</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 appearance-none"
                  >
                    {ADMIN_LIST.map((admin) => (
                      <option key={admin.id} value={admin.id} className="bg-[#141415]">
                        {admin.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Status inicial</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value as KanbanStatus })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 appearance-none"
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id} className="bg-[#141415]">
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Tarefa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Reason Modal */}
      <AnimatePresence>
        {showPauseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowPauseModal(null); setPauseReason(""); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141415] rounded-2xl p-6 w-full max-w-sm border border-white/[0.06]"
            >
              <div className="flex items-center gap-2 mb-4">
                <Pause className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-white">Pausar Tarefa</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">Informe o motivo da pausa:</p>
              <textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Ex: Aguardando aprovação do cliente..."
                rows={3}
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPauseModal(null); setPauseReason(""); }}
                  className="flex-1 bg-white/5 border border-white/10 text-gray-300 font-medium py-2.5 rounded-xl text-sm hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePauseConfirm}
                  disabled={!pauseReason.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
                >
                  Pausar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
