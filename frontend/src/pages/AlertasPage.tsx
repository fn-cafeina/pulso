import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { AlertTriangle, Plus, Pencil, Trash2, Ban, Filter } from "lucide-react";
import { useAuthStore } from "../stores/auth";
import { useAlertFiltersStore } from "../stores/alertFilters";
import { useAlertsStore, deactivateAlert } from "../stores/alerts";
import { useToastStore } from "../stores/toast";
import { useDelayedLoading } from "../lib/useDelayedLoading";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import Pagination from "../components/ui/Pagination";
import type { AlertNivel, EpiAlert } from "../types";

const nivelesForm: { value: AlertNivel; label: string }[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

const nivelBadge: Record<AlertNivel, string> = {
  bajo: "bg-success/10 text-success",
  medio: "bg-warning/10 text-warning",
  alto: "bg-high/10 text-high",
  critico: "bg-danger/10 text-danger",
};

const sortOrder: Record<AlertNivel, number> = {
  critico: 0,
  alto: 1,
  medio: 2,
  bajo: 3,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface CreateFormProps {
  form: { titulo: string; descripcion: string; nivel: AlertNivel | ""; departamento: string; fuente: string }
  setForm: React.Dispatch<React.SetStateAction<{ titulo: string; descripcion: string; nivel: AlertNivel | ""; departamento: string; fuente: string }>>
  creating: boolean
  formDisabled: boolean
  onCreate: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

function CreateForm({ form, setForm, creating, formDisabled, onCreate, onCancel, submitLabel = "Crear alerta" }: CreateFormProps) {
  return (
    <form onSubmit={onCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Título <span className="text-danger">*</span></label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          placeholder="Ej: Alerta por dengue"
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Describe la alerta..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Nivel <span className="text-danger">*</span></label>
          <select
            value={form.nivel}
            onChange={(e) => setForm({ ...form, nivel: e.target.value as AlertNivel })}
            className="w-full rounded-button border border-gray/30 bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            required
          >
            <option value="">Seleccionar nivel</option>
            {nivelesForm.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Departamento</label>
          <input
            type="text"
            value={form.departamento}
            onChange={(e) => setForm({ ...form, departamento: e.target.value })}
            placeholder="Ej: León"
            className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Fuente</label>
        <input
          type="text"
          value={form.fuente}
          onChange={(e) => setForm({ ...form, fuente: e.target.value })}
          placeholder="Ej: Ministerio de Salud Pública"
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray hover:text-text font-medium transition-colors cursor-pointer py-2.5 px-5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={formDisabled}
          className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
        >
          {creating ? (submitLabel === "Guardar cambios" ? "Guardando..." : "Creando...") : submitLabel}
        </button>
      </div>
    </form>
  );
}

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
  const [showFilters, setShowFilters] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (showFilters && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      const gap = 12;
      const overflow = rect.left + 224 + gap - window.innerWidth;
      setFilterOffset(overflow > 0 ? -(overflow) : 0);
    }
  }, [showFilters]);

  const loadingInitial = loading && items.length === 0 && !creating;
  const showSkeleton = useDelayedLoading(loadingInitial);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

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
      // edge case: if we deleted the last item on a non-first page, go back
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

  function handleViewDetail(alert: EpiAlert) {
    setDetailAlert(alert);
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
  const errorInitial = error && items.length === 0 && !loading;
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
          <AlertBanner message={error} onClose={clearError} />
          <button
            onClick={handleRefresh}
            className="mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-button transition-all cursor-pointer"
          >
            Reintentar
          </button>
        </>
      )}

      {!showSkeleton && (
        <>
          {!errorInitial && (
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
                <div ref={filterRef} className="relative">
                  <button
                    ref={filterButtonRef}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                      nivel || departamento ? "bg-primary/10 text-primary" : "text-gray hover:text-text bg-gray/10 hover:bg-gray/15"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filtrar
                  </button>
                  {showFilters && (
                    <div className="absolute top-full mt-2 z-50 bg-surface rounded-card shadow-lg border border-gray/10 p-4 w-56 animate-scale-in" style={{ left: filterOffset }}>
                      <p className="text-xs font-semibold text-gray mb-2">Nivel</p>
                      <div className="space-y-1 mb-4">
                        <label className="flex items-center gap-2 px-2 py-1.5 rounded-button text-sm cursor-pointer hover:bg-gray/10 transition-colors">
                          <input type="radio" name="nivel" checked={nivel === ""} onChange={() => setNivel("")} className="accent-primary" />
                          <span className="text-text">Todos</span>
                        </label>
                        {nivelesForm.map((n) => (
                          <label key={n.value} className="flex items-center gap-2 px-2 py-1.5 rounded-button text-sm cursor-pointer hover:bg-gray/10 transition-colors">
                            <input type="radio" name="nivel" checked={nivel === n.value} onChange={() => setNivel(n.value)} className="accent-primary" />
                            <span className="text-text">{n.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-gray mb-2">Departamento</p>
                      <input
                        type="text"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        placeholder="Ej: Managua, León..."
                        className="w-full px-3 py-1.5 rounded-button border border-gray/30 bg-surface text-sm text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                      {(nivel || departamento) && (
                        <button
                          onClick={() => { setNivel(""); setDepartamento(""); }}
                          className="mt-3 text-xs text-danger hover:text-danger/80 font-medium transition-colors cursor-pointer"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {error && !errorInitial && (
            <div className="mb-4">
              <AlertBanner message={error} onClose={clearError} onRetry={handleRefresh} />
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
                  {sorted.map((alert) => {
                  const badgeClass = nivelBadge[alert.nivel] || "bg-gray/10 text-gray";
                  return (
                    <div
                      key={alert.id}
                      className="bg-surface rounded-card p-6 transition-all animate-fade-in-up cursor-pointer hover:ring-1 hover:ring-primary/20"
                      onClick={() => handleViewDetail(alert)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-semibold ${badgeClass}`}>
                            {alert.nivel}
                          </span>
                          {!alert.activa && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-semibold bg-gray/10 text-gray">
                              Inactiva
                            </span>
                          )}
                        </div>
                        {rol === "health_worker" ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {alert.activa && (
                              <>
                                <button
                                  onClick={() => setConfirmDeactivate(alert.id)}
                                  className="text-xs text-gray hover:text-danger font-medium transition-colors cursor-pointer flex items-center gap-1"
                                  title="Desactivar"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Desactivar</span>
                                </button>
                                <button
                                  onClick={() => handleEdit(alert)}
                                  className="text-xs text-gray hover:text-primary font-medium transition-colors cursor-pointer flex items-center gap-1"
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Editar</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setConfirmDelete(alert.id)}
                              className="text-xs text-gray hover:text-danger font-medium transition-colors cursor-pointer flex items-center gap-1"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Eliminar</span>
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <h3 className="font-semibold text-text mb-1">{alert.titulo}</h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray">
                        {alert.departamento && <span>{alert.departamento}</span>}
                        {alert.fuente && <span>{alert.fuente}</span>}
                        <span>{formatDate(alert.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
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
        </>
      )}

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editingAlert ? "Editar alerta" : "Nueva alerta"}
      >
        <CreateForm
          form={form}
          setForm={setForm}
          creating={creating || updating}
          formDisabled={formDisabled}
          onCreate={editingAlert ? handleUpdate : handleCreate}
          onCancel={resetForm}
          submitLabel={editingAlert ? "Guardar cambios" : "Crear alerta"}
        />
      </Modal>

      <Modal
        open={detailAlert !== null}
        onClose={() => setDetailAlert(null)}
        title="Detalle de alerta"
        scrollable
      >
        {detailAlert && (
          <div className="space-y-4">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-semibold ${detailAlert.activa ? nivelBadge[detailAlert.nivel] || "bg-gray/10 text-gray" : "bg-gray/10 text-gray"}`}>
                {detailAlert.activa ? detailAlert.nivel : "Inactiva"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1">Título</label>
              <p className="text-text font-semibold">{detailAlert.titulo}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray mb-1">Descripción</label>
              <p className="text-sm text-text whitespace-pre-wrap">{detailAlert.descripcion || "Sin descripción"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Nivel</label>
                <p className="text-sm text-text capitalize">{detailAlert.nivel}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Estado</label>
                <p className="text-sm text-text">{detailAlert.activa ? "Activa" : "Inactiva"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Departamento</label>
                <p className="text-sm text-text">{detailAlert.departamento || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Fuente</label>
                <p className="text-sm text-text">{detailAlert.fuente || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Creada</label>
                <p className="text-sm text-text">{formatDate(detailAlert.created_at)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray mb-1">Actualizada</label>
                <p className="text-sm text-text">{formatDate(detailAlert.updated_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

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
