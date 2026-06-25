import { useState, useEffect, useRef } from "react";
import { Bell, Plus } from "lucide-react";
import { useRemindersStore } from "../stores/reminders";
import { useToastStore } from "../stores/toast";
import { usePageLoader } from "../hooks/usePageLoader";
import { useDelayedLoading } from "../lib/useDelayedLoading";
import Modal from "../components/ui/Modal";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import Pagination from "../components/ui/Pagination";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ReminderCard from "../components/recordatorios/ReminderCard";
import ReminderForm from "../components/recordatorios/ReminderForm";
import ReminderDetailModal from "../components/recordatorios/ReminderDetailModal";
import type { Reminder, ReminderTipo } from "../types";

type Tab = "pendientes" | "historial";

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
  const { showSkeleton, errorInitial } = usePageLoader(loadingInitial, error, items.length);

  const activeItems = tab === "pendientes" ? items : history;
  const loadingActive = tab === "pendientes" ? loading : loadingHistory;
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
      if (tab === "historial" && activeItems.length === 1 && historyPage > 1) {
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
          <AlertBanner message={error!} onClose={clearError} />
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
          <AlertBanner message={error!} onClose={clearError} onRetry={handleRefresh} />
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
              {activeItems.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  tab={tab}
                  marking={marking}
                  onEdit={handleEdit}
                  onMarkRead={handleMarkRead}
                  onDelete={(id) => setConfirmDelete(id)}
                  onClick={setDetailReminder}
                />
              ))}
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
        <ReminderForm
          form={form}
          setForm={setForm}
          editingReminder={editingReminder}
          creating={creating}
          updating={updating}
          formDisabled={formDisabled}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </Modal>

      <ReminderDetailModal reminder={detailReminder} onClose={() => setDetailReminder(null)} />

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
