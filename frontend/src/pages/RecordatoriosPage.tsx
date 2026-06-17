import { useState, useEffect, useRef } from "react";
import { Bell, Plus, Trash2, Check, Calendar, Syringe, FileText, Clock, Pencil } from "lucide-react";
import { useRemindersStore } from "../stores/reminders";
import { useToastStore } from "../stores/toast";
import { useDelayedLoading } from "../lib/useDelayedLoading";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import Pagination from "../components/ui/Pagination";
import type { Reminder, ReminderTipo } from "../types";

type Tab = "pendientes" | "historial";

const tipoBadge: Record<ReminderTipo, string> = {
  cita: "bg-blue/10 text-blue",
  vacuna: "bg-success/10 text-success",
  manual: "bg-warning/10 text-warning",
};

const tipoIcon: Record<ReminderTipo, typeof Calendar> = {
  cita: Calendar,
  vacuna: Syringe,
  manual: FileText,
};

const tipoLabel: Record<ReminderTipo, string> = {
  cita: "Cita médica",
  vacuna: "Vacuna",
  manual: "Manual",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function toDatetimeLocal(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function RecordatoriosPage() {
  const { items, history, meta, loading, loadingHistory, error, fetch, fetchHistory, add, updateItem, markRead, remove, clearError } = useRemindersStore();
  const [tab, setTab] = useState<Tab>("pendientes");
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", fecha: "", tipo: "" as ReminderTipo | "" });
  const [detailReminder, setDetailReminder] = useState<Reminder | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [marking, setMarking] = useState<number | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const perPage = 20;
  const initialLoad = useRef(true);

  const loadingInitial = loading && items.length === 0 && !creating;
  const showSkeleton = useDelayedLoading(loadingInitial);

  const activeItems = tab === "pendientes" ? items : history;
  const loadingActive = tab === "pendientes" ? loading : loadingHistory;
  const errorInitial = error && activeItems.length === 0 && !loadingActive;
  const empty = !loadingActive && activeItems.length === 0 && !errorInitial;
  const showTabSkeleton = useDelayedLoading(loadingActive && activeItems.length === 0 && !errorInitial);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetch();
    }
  }, [fetch]);

  useEffect(() => {
    if (tab === "historial") {
      fetchHistory(historyPage, perPage);
    }
  }, [tab, historyPage, fetchHistory]);

  function handleRefresh() {
    if (tab === "pendientes") {
      fetch();
    } else {
      fetchHistory(historyPage, perPage);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingReminder(null);
    setForm({ titulo: "", descripcion: "", fecha: "", tipo: "" });
  }

  function handleEdit(reminder: Reminder) {
    setForm({
      titulo: reminder.titulo,
      descripcion: reminder.descripcion,
      fecha: toDatetimeLocal(reminder.fecha),
      tipo: reminder.tipo,
    });
    setEditingReminder(reminder);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo || !form.fecha || !form.tipo) return;

    const fechaISO = new Date(form.fecha).toISOString().replace(/\.\d{3}Z$/, "Z");

    if (editingReminder) {
      setUpdating(true);
      try {
        await updateItem(editingReminder.id, {
          titulo: form.titulo,
          descripcion: form.descripcion || undefined,
          fecha: fechaISO,
          tipo: form.tipo,
        });
        resetForm();
        useToastStore.getState().add("Recordatorio actualizado");
      } catch {
        useToastStore.getState().add("Error al actualizar recordatorio", "error");
      } finally {
        setUpdating(false);
      }
    } else {
      setCreating(true);
      try {
        await add({
          titulo: form.titulo,
          descripcion: form.descripcion || undefined,
          fecha: fechaISO,
          tipo: form.tipo,
        });
        resetForm();
        useToastStore.getState().add("Recordatorio creado");
      } catch {
        useToastStore.getState().add("Error al crear recordatorio", "error");
      } finally {
        setCreating(false);
      }
    }
  }

  async function handleMarkRead(id: number) {
    setMarking(id);
    try {
      await markRead(id);
      useToastStore.getState().add("Recordatorio marcado como leído");
    } catch {
      useToastStore.getState().add("Error al marcar recordatorio", "error");
    } finally {
      setMarking(null);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await remove(id);
      useToastStore.getState().add("Recordatorio eliminado");
      if (tab === "historial" && activeItems.length === 0 && historyPage > 1) {
        setHistoryPage(historyPage - 1);
      }
    } catch {
      useToastStore.getState().add("Error al eliminar recordatorio", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  const formDisabled = (creating || updating) || !form.titulo || !form.fecha || !form.tipo;
  const totalPages = meta ? Math.ceil(meta.total / meta.per_page) : 0;

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      {showSkeleton && (
        <div className="space-y-4">
          <div className="h-8 bg-gray/20 rounded w-48 animate-pulse-gentle" />
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {errorInitial && (
        <>
          <AlertBanner message={error} onClose={clearError} />
          <button
            onClick={handleRefresh}
            className="mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-button transition-all cursor-pointer"
          >
            Reintentar
          </button>
        </>
      )}

      {!showSkeleton && !errorInitial && (
        <>
          <h2 className="hidden md:block text-lg font-bold text-text mb-4">Recordatorios</h2>

          <div className="flex gap-1 mb-6 bg-gray/10 rounded-button p-1 w-fit">
            <button
              onClick={() => setTab("pendientes")}
              className={`px-4 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                tab === "pendientes" ? "bg-surface text-text shadow-xs" : "text-gray hover:text-text"
              }`}
            >
              Pendientes
              {items.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary/20 text-primary rounded-full">
                  {items.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("historial")}
              className={`px-4 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                tab === "historial" ? "bg-surface text-text shadow-xs" : "text-gray hover:text-text"
              }`}
            >
              Historial
            </button>
          </div>
        </>
      )}

      {error && !errorInitial && (
        <div className="mb-4">
          <AlertBanner message={error} onClose={clearError} onRetry={handleRefresh} />
        </div>
      )}

      {showTabSkeleton && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      <div className="transition-opacity duration-200">
        {empty && (
          <EmptyState
            icon={<Bell className="w-5 h-5 text-primary" />}
            title={tab === "pendientes" ? "No hay recordatorios pendientes" : "No hay historial"}
            description={tab === "pendientes"
              ? "No tienes recordatorios pendientes. Usa el botón + para crear uno."
              : "Aún no hay recordatorios en tu historial."}
          />
        )}

        {activeItems.length > 0 && (
          <>
            <div className="space-y-3">
              {activeItems.map((reminder) => {
                const TipoIcon = tipoIcon[reminder.tipo] || FileText;
                const badgeClass = tipoBadge[reminder.tipo] || "bg-gray/10 text-gray";
                const overdue = tab === "pendientes" && !reminder.leido && isOverdue(reminder.fecha);

                return (
                  <div
                    key={reminder.id}
                    className={`bg-surface rounded-card p-6 transition-all animate-fade-in-up cursor-pointer hover:ring-1 hover:ring-primary/20 ${
                      reminder.leido ? "opacity-70" : ""
                    }`}
                    onClick={() => setDetailReminder(reminder)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold ${badgeClass}`}>
                          <TipoIcon className="w-3 h-3" />
                          {tipoLabel[reminder.tipo]}
                        </span>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold bg-danger/10 text-danger">
                            <Clock className="w-3 h-3" />
                            Vencido
                          </span>
                        )}
                        {reminder.leido && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold bg-gray/10 text-gray">
                            <Check className="w-3 h-3" />
                            Leído
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {!reminder.leido && (
                          <button
                            onClick={() => handleEdit(reminder)}
                            className="text-xs text-gray hover:text-primary font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Editar</span>
                          </button>
                        )}
                        {tab === "pendientes" && !reminder.leido && (
                          <button
                            onClick={() => handleMarkRead(reminder.id)}
                            disabled={marking === reminder.id}
                            className="text-xs text-gray hover:text-success font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Marcar leído"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">{marking === reminder.id ? "..." : "Marcar leído"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(reminder.id)}
                          className="text-xs text-gray hover:text-danger font-medium transition-colors cursor-pointer flex items-center gap-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-text mb-1">{reminder.titulo}</h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(reminder.fecha)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {tab === "historial" && meta && (
              <Pagination
                page={historyPage}
                totalPages={totalPages}
                totalItems={meta.total}
                itemLabel="recordatorios"
                onPrev={() => setHistoryPage(historyPage - 1)}
                onNext={() => setHistoryPage(historyPage + 1)}
              />
            )}
          </>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editingReminder ? "Editar recordatorio" : "Nuevo recordatorio"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Título <span className="text-danger">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Revisión con Dr. Pérez"
              className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Fecha y hora <span className="text-danger">*</span></label>
            <input
              type="datetime-local"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full rounded-button border border-gray/30 bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Tipo <span className="text-danger">*</span></label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as ReminderTipo })}
              className="w-full rounded-button border border-gray/30 bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="cita">Cita médica</option>
              <option value="vacuna">Vacuna</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray hover:text-text font-medium transition-colors cursor-pointer py-2.5 px-5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formDisabled}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(creating || updating)
                ? (editingReminder ? "Guardando..." : "Creando...")
                : (editingReminder ? "Guardar cambios" : "Crear recordatorio")}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={detailReminder !== null}
        onClose={() => setDetailReminder(null)}
        title="Detalle de recordatorio"
        scrollable
      >
        {detailReminder && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold ${tipoBadge[detailReminder.tipo] || "bg-gray/10 text-gray"}`}>
                {(() => {
                  const Icon = tipoIcon[detailReminder.tipo] || FileText;
                  return <Icon className="w-3 h-3" />;
                })()}
                {tipoLabel[detailReminder.tipo]}
              </span>
              {detailReminder.leido && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold bg-gray/10 text-gray">
                  <Check className="w-3 h-3" />
                  Leído
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1">Título</label>
              <p className="text-text font-semibold">{detailReminder.titulo}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1">Descripción</label>
              <p className="text-sm text-text whitespace-pre-wrap">{detailReminder.descripcion || "Sin descripción"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Fecha</label>
                <p className="text-sm text-text">{formatDateTime(detailReminder.fecha)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Tipo</label>
                <p className="text-sm text-text capitalize">{tipoLabel[detailReminder.tipo]}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Creado</label>
                <p className="text-sm text-text">{formatDate(detailReminder.created_at)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Actualizado</label>
                <p className="text-sm text-text">{formatDate(detailReminder.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete!)}
        title="Eliminar recordatorio"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        confirmLoading={deleting}
      />

      {!showSkeleton && !errorInitial && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 md:bottom-6 right-4 z-40 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Nuevo recordatorio"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
