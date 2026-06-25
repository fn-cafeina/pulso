import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { useAuthStore } from "../stores/auth";
import { useAlertFiltersStore } from "../stores/alertFilters";
import { useAlertsStore, deactivateAlert } from "../stores/alerts";
import { useToastStore } from "../stores/toast";
import { usePageLoader } from "../hooks/usePageLoader";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import Pagination from "../components/ui/Pagination";
import CreateAlertForm from "../components/alertas/CreateAlertForm";
import AlertCard from "../components/alertas/AlertCard";
import AlertFiltersPopover from "../components/alertas/AlertFiltersPopover";
import AlertDetailModal from "../components/alertas/AlertDetailModal";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import type { AlertNivel, EpiAlert, UserRol } from "../types";

const sortOrder: Record<AlertNivel, number> = {
  critico: 0,
  alto: 1,
  medio: 2,
  bajo: 3,
};

export default function AlertasPage() {
  const { rol } = useAuthStore();
  const { items, loading, error, meta, fetch, refresh, add, updateItem, removeItem, clearError } = useAlertsStore();
  const { soloActivas, nivel, departamento, page, perPage, setSoloActivas, setNivel, setDepartamento, setPage, setPerPage } = useAlertFiltersStore();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingAlert, setEditingAlert] = useState<EpiAlert | null>(null);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", nivel: "" as AlertNivel | "", departamento: "", fuente: "" });
  const [confirmDeactivate, setConfirmDeactivate] = useState<number | null>(null);
  const [desactivando, setDesactivando] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailAlert, setDetailAlert] = useState<EpiAlert | null>(null);
  const initialLoad = useRef(true);

  const loadingInitial = loading && items.length === 0 && !creating;
  const { showSkeleton, errorInitial } = usePageLoader(loadingInitial, error, items.length);

  const buildParams = useCallback((pg: number): Record<string, unknown> => {
    const params: Record<string, unknown> = {};
    if (soloActivas) params.activas = true;
    if (nivel) params.nivel = nivel;
    if (departamento) params.departamento = departamento;
    params.page = pg;
    params.per_page = perPage;
    return params;
  }, [soloActivas, nivel, departamento, perPage]);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetch(buildParams(page));
    } else {
      refresh(buildParams(page));
    }
  }, [soloActivas, nivel, departamento, page, perPage, fetch, refresh, buildParams]);

  function handleRefresh() {
    fetch(buildParams(page));
  }

  async function handleDeactivate(id: number) {
    setDesactivando(id);
    try {
      await deactivateAlert(id);
      useToastStore.getState().add("Alerta desactivada");
      useAlertsStore.setState((s) => {
        let newItems = s.items.map((a) => (a.id === id ? { ...a, activa: false } : a));
        if (soloActivas) {
          newItems = newItems.filter((a) => a.id !== id);
          if (newItems.length === 0 && page > 1) {
            setPage(page - 1);
          }
        }
        return {
          items: newItems,
          meta: s.meta ? { ...s.meta, total: s.meta.total - 1 } : s.meta,
        };
      });
    } catch {
      useToastStore.getState().add("Error al desactivar", "error");
    } finally {
      setDesactivando(null);
    }
  }

  function handleEdit(alert: EpiAlert) {
    setForm({
      titulo: alert.titulo,
      descripcion: alert.descripcion,
      nivel: alert.nivel,
      departamento: alert.departamento,
      fuente: alert.fuente,
    });
    setEditingAlert(alert);
    setShowForm(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAlert || !form.titulo || !form.nivel) return;
    setUpdating(true);
    try {
      await updateItem(editingAlert.id, {
        titulo: form.titulo,
        descripcion: form.descripcion || undefined,
        nivel: form.nivel,
        departamento: form.departamento || undefined,
        fuente: form.fuente || undefined,
      });
      setShowForm(false);
      setEditingAlert(null);
      setForm({ titulo: "", descripcion: "", nivel: "", departamento: "", fuente: "" });
      useToastStore.getState().add("Alerta actualizada");
    } catch {
      useToastStore.getState().add("Error al actualizar alerta", "error");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await removeItem(id);
      useToastStore.getState().add("Alerta eliminada");
      useAlertsStore.setState((s) => ({
        meta: s.meta ? { ...s.meta, total: s.meta.total - 1 } : s.meta,
      }));
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch {
      useToastStore.getState().add("Error al eliminar alerta", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo || !form.nivel) return;
    setCreating(true);
    try {
      await add({
        titulo: form.titulo,
        descripcion: form.descripcion || undefined,
        nivel: form.nivel,
        departamento: form.departamento || undefined,
        fuente: form.fuente || undefined,
      });
      setShowForm(false);
      setForm({ titulo: "", descripcion: "", nivel: "", departamento: "", fuente: "" });
      useToastStore.getState().add("Alerta creada");
    } catch {
      useToastStore.getState().add("Error al crear alerta", "error");
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingAlert(null);
    setForm({ titulo: "", descripcion: "", nivel: "", departamento: "", fuente: "" });
  }

  const formDisabled = (creating || updating) || !form.titulo || !form.nivel;
  const empty = !loading && items.length === 0;

  const shouldSort = !meta;
  const sorted = useMemo(
    () => (shouldSort ? [...items].sort((a, b) => (sortOrder[a.nivel] ?? 99) - (sortOrder[b.nivel] ?? 99)) : items),
    [items, shouldSort]
  );

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
          <h2 className="hidden md:block text-lg font-bold text-text mb-4">Alertas Epidemiológicas</h2>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1 bg-gray/10 rounded-button p-1 w-fit">
              <button
                onClick={() => setSoloActivas(true)}
                className={`px-4 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                  soloActivas ? "bg-surface text-text shadow-xs" : "text-gray hover:text-text"
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setSoloActivas(false)}
                className={`px-4 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                  !soloActivas ? "bg-surface text-text shadow-xs" : "text-gray hover:text-text"
                }`}
              >
                Todas
              </button>
            </div>
            <AlertFiltersPopover
              nivel={nivel}
              departamento={departamento}
              onNivelChange={setNivel}
              onDepartamentoChange={setDepartamento}
              onClear={() => { setNivel(""); setDepartamento(""); }}
            />
          </div>
        </>
      )}

      {error && !errorInitial && (
        <div className="mb-4">
          <AlertBanner message={error!} onClose={clearError} onRetry={handleRefresh} />
        </div>
      )}

      <div className="transition-opacity duration-200">
        {empty && !errorInitial && (
          <EmptyState
            icon={<AlertTriangle className="w-5 h-5 text-primary" />}
            title={soloActivas ? "No hay alertas activas" : "No hay alertas"}
            description={soloActivas
              ? "No hay alertas epidemiológicas activas en este momento."
              : "No hay alertas epidemiológicas registradas."}
          />
        )}

        {items.length > 0 && (
          <div className="space-y-3">
            {sorted.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                rol={rol as UserRol | undefined}
                onViewDetail={setDetailAlert}
                onEdit={handleEdit}
                onDeactivate={(id) => setConfirmDeactivate(id)}
                onDelete={(id) => setConfirmDelete(id)}
              />
            ))}
          </div>
        )}

        {meta && meta.total > perPage && (
          <>
            <Pagination
              page={meta.page}
              totalPages={Math.ceil(meta.total / meta.per_page)}
              totalItems={meta.total}
              itemLabel="alertas"
              onPrev={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            />
            <div className="flex justify-end mt-2">
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-button border border-gray/30 bg-surface px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editingAlert ? "Editar alerta" : "Nueva alerta"}
      >
        <CreateAlertForm
          form={form}
          setForm={setForm}
          creating={creating || updating}
          formDisabled={formDisabled}
          onCreate={editingAlert ? handleUpdate : handleCreate}
          onCancel={resetForm}
          submitLabel={editingAlert ? "Guardar cambios" : "Crear alerta"}
        />
      </Modal>

      <AlertDetailModal alert={detailAlert} onClose={() => setDetailAlert(null)} />

      <ConfirmDialog
        open={confirmDeactivate !== null}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={() => {
          const id = confirmDeactivate!;
          setConfirmDeactivate(null);
          handleDeactivate(id);
        }}
        title="Desactivar alerta"
        message="¿Estás seguro? La alerta dejará de mostrarse como activa."
        confirmLabel="Desactivar"
        confirmLoading={desactivando === confirmDeactivate}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete!)}
        title="Eliminar alerta"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        confirmLoading={deleting}
      />

      {!showSkeleton && !errorInitial && rol === "health_worker" && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 md:bottom-6 right-4 z-40 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Crear alerta"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
