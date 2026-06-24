import { useEffect, useRef, useState, useMemo } from "react";
import { ClipboardList, Stethoscope, Syringe, CalendarDays, Plus, Pencil, Trash2, type LucideIcon } from "lucide-react";
import { useSymptomsStore } from "../stores/symptoms";
import { useVaccinesStore } from "../stores/vaccines";
import { useAppointmentsStore } from "../stores/appointments";
import { useToastStore } from "../stores/toast";
import { useDelayedLoading } from "../lib/useDelayedLoading";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import CreateSymptomForm from "../components/historial/CreateSymptomForm";
import CreateVaccineForm from "../components/historial/CreateVaccineForm";
import CreateAppointmentForm from "../components/historial/CreateAppointmentForm";
import type { SymptomReport, VaccinationRecord, Appointment } from "../types";

type CreateTab = "sintoma" | "vacuna" | "cita";

const createTabs: { key: CreateTab; label: string; icon: React.ReactNode }[] = [
  { key: "sintoma", label: "Síntoma", icon: <Stethoscope className="w-4 h-4" /> },
  { key: "vacuna", label: "Vacuna", icon: <Syringe className="w-4 h-4" /> },
  { key: "cita", label: "Cita", icon: <CalendarDays className="w-4 h-4" /> },
];

const typeLabel: Record<CreateTab, string> = {
  sintoma: "Síntoma",
  vacuna: "Vacuna",
  cita: "Cita",
};

interface DetailData {
  type: CreateTab
  raw: SymptomReport | VaccinationRecord | Appointment
}

interface RawItem {
  id: number
  type: CreateTab
  title: string
  rawDate: string
  raw: SymptomReport | VaccinationRecord | Appointment
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Period = "hoy" | "ayer" | "semana" | "mes" | "antes";

const periodLabel: Record<Period, string> = {
  hoy: "HOY",
  ayer: "AYER",
  semana: "ESTA SEMANA",
  mes: "ESTE MES",
  antes: "ANTES",
};

function getPeriod(dateStr: string): Period {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "hoy";
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days <= 7) return "semana";
  if (days <= 30) return "mes";
  return "antes";
}

function getRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 6) return `Hace ${hours} h`;
  if (days === 0) return `Hace ${hours} h`;
  if (days === 1) return "Ayer";
  if (days <= 7) return `Hace ${days} días`;
  return formatDate(dateStr);
}

function getAbsoluteDate(dateStr: string, type: CreateTab): string {
  if (type === "cita") return formatDateTime(dateStr);
  return formatDate(dateStr);
}

function DetailView({ detail, onClose }: { detail: DetailData; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`Detalle de ${typeLabel[detail.type].toLowerCase()}`} scrollable>
      <div className="space-y-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold bg-primary/10 text-primary">
            {typeLabel[detail.type]}
          </span>
        </div>

        {"descripcion" in detail.raw && (
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Descripción</label>
            <p className="text-sm text-text whitespace-pre-wrap">{detail.raw.descripcion || "Sin descripción"}</p>
          </div>
        )}
        {"nombre_vacuna" in detail.raw && (
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Vacuna</label>
            <p className="text-sm text-text font-semibold">{detail.raw.nombre_vacuna}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {detail.type === "vacuna" ? (
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Fecha de aplicación</label>
              <p className="text-sm text-text">{formatDate("fecha_aplicacion" in detail.raw ? detail.raw.fecha_aplicacion : "")}</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Fecha</label>
              <p className="text-sm text-text">{detail.type === "cita" ? formatDateTime((detail.raw as Appointment).fecha) : formatDate((detail.raw as SymptomReport).fecha)}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Registrado</label>
            <p className="text-sm text-text">{formatDate(detail.raw.created_at)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray mb-1">Actualizado</label>
            <p className="text-sm text-text">{formatDate(detail.raw.updated_at)}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function HistorialPage() {
  const sym = useSymptomsStore();
  const vac = useVaccinesStore();
  const appt = useAppointmentsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [createTab, setCreateTab] = useState<CreateTab>("sintoma");
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [editing, setEditing] = useState<DetailData | null>(null);
  const [editForm, setEditForm] = useState({ descripcion: "", fecha: "" });
  const [confirmDelete, setConfirmDelete] = useState<DetailData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const initialLoad = useRef(true);

  const hasItems = sym.items.length > 0 || vac.items.length > 0 || appt.items.length > 0;
  const anyLoading = sym.loading || vac.loading || appt.loading;
  const loadingInitial = anyLoading && !hasItems;
  const showSkeleton = useDelayedLoading(loadingInitial);
  const errors = useMemo(() => {
    const e: { source: string; msg: string }[] = [];
    if (sym.error) e.push({ source: "síntomas", msg: sym.error });
    if (vac.error) e.push({ source: "vacunas", msg: vac.error });
    if (appt.error) e.push({ source: "citas", msg: appt.error });
    return e;
  }, [sym.error, vac.error, appt.error]);
  const errorInitial = errors.length > 0 && !hasItems && !anyLoading;

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      sym.fetch();
      vac.fetch();
      appt.fetch();
    }
  }, []);

  function handleRefresh() {
    sym.fetch();
    vac.fetch();
    appt.fetch();
  }

  function handleFabClick() {
    setCreateTab("sintoma");
    setShowCreate(true);
  }

  function handleDetail(type: CreateTab, raw: SymptomReport | VaccinationRecord | Appointment) {
    setDetail({ type, raw });
  }

  function handleEditClick(type: CreateTab, raw: SymptomReport | VaccinationRecord | Appointment) {
    if ("fecha" in raw && typeof raw.fecha === "string") {
      setEditForm({ descripcion: (raw as SymptomReport).descripcion || "", fecha: raw.fecha.slice(0, 10) });
    } else if ("fecha_aplicacion" in raw && typeof raw.fecha_aplicacion === "string") {
      setEditForm({ descripcion: (raw as VaccinationRecord).nombre_vacuna || "", fecha: raw.fecha_aplicacion.slice(0, 10) });
    } else if ("fecha" in raw && typeof raw.fecha === "string") {
      const d = new Date(raw.fecha);
      const pad = (n: number) => String(n).padStart(2, "0");
      setEditForm({
        descripcion: (raw as Appointment).descripcion || "",
        fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
      });
    }
    setEditing({ type, raw });
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editForm.descripcion.trim()) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {};
      if (editing.type === "sintoma") {
        body.descripcion = editForm.descripcion.trim();
        if (editForm.fecha) body.fecha = new Date(editForm.fecha + "T00:00:00").toISOString();
        await sym.updateItem(editing.raw.id, body);
      } else if (editing.type === "vacuna") {
        body.nombre_vacuna = editForm.descripcion.trim();
        if (editForm.fecha) body.fecha_aplicacion = new Date(editForm.fecha + "T00:00:00").toISOString();
        await vac.updateItem(editing.raw.id, body);
      } else {
        body.descripcion = editForm.descripcion.trim();
        if (editForm.fecha) body.fecha = new Date(editForm.fecha).toISOString();
        await appt.updateItem(editing.raw.id, body);
      }
      useToastStore.getState().add("Registro actualizado");
      setEditing(null);
    } catch {
      useToastStore.getState().add("Error al actualizar", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    const { type, raw } = confirmDelete;
    try {
      if (type === "sintoma") await sym.removeItem(raw.id);
      else if (type === "vacuna") await vac.removeItem(raw.id);
      else await appt.removeItem(raw.id);
      useToastStore.getState().add("Registro eliminado");
      setConfirmDelete(null);
      if (detail?.raw.id === raw.id) setDetail(null);
    } catch {
      useToastStore.getState().add("Error al eliminar", "error");
    }
  }

  const items = useMemo(() => {
    const all: RawItem[] = [
      ...sym.items.map((s) => ({ id: s.id, type: "sintoma" as CreateTab, title: s.descripcion, rawDate: s.fecha || s.created_at, raw: s })),
      ...vac.items.map((v) => ({ id: v.id, type: "vacuna" as CreateTab, title: v.nombre_vacuna, rawDate: v.fecha_aplicacion || v.created_at, raw: v })),
      ...appt.items.map((a) => ({ id: a.id, type: "cita" as CreateTab, title: a.descripcion, rawDate: a.fecha, raw: a })),
    ];
    return all.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
  }, [sym.items, vac.items, appt.items]);

  const empty = !anyLoading && items.length === 0;
  const partialError = errors.length > 0 && hasItems && !anyLoading;

  const typeColors: Record<CreateTab, string> = {
    sintoma: "bg-info/10 text-info",
    vacuna: "bg-success/10 text-success",
    cita: "bg-primary/10 text-primary",
  };

  const typeIconComponent: Record<CreateTab, LucideIcon> = {
    sintoma: Stethoscope,
    vacuna: Syringe,
    cita: CalendarDays,
  };

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      {showSkeleton && (
        <div className="space-y-4">
          <div className="h-8 bg-gray/20 rounded w-48 animate-pulse-gentle" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray/10 rounded-card animate-pulse-gentle" />
            ))}
          </div>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {errorInitial && (
        <>
          {errors.map((e) => (
            <div key={e.source} className="mb-2">
              <AlertBanner message={`${e.source}: ${e.msg}`} onClose={() => { sym.clearError(); vac.clearError(); appt.clearError(); }} />
            </div>
          ))}
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
          <h2 className="hidden md:block text-lg font-bold text-text mb-6">Mi Historial</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-surface rounded-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-info" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-text">{sym.items.length}</p>
                <p className="text-xs text-gray truncate">Síntomas</p>
              </div>
            </div>
            <div className="bg-surface rounded-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Syringe className="w-5 h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-text">{vac.items.length}</p>
                <p className="text-xs text-gray truncate">Vacunas</p>
              </div>
            </div>
            <div className="bg-surface rounded-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-text">{appt.items.length}</p>
                <p className="text-xs text-gray truncate">Citas</p>
              </div>
            </div>
          </div>

          {partialError && (
            <div className="space-y-2 mb-4">
              {errors.map((e) => (
                <AlertBanner key={e.source} message={`${e.source}: ${e.msg}`} onClose={() => { sym.clearError(); vac.clearError(); appt.clearError(); }} onRetry={handleRefresh} />
              ))}
            </div>
          )}

          <div className="transition-opacity duration-200">
            {empty && !errorInitial && (
              <EmptyState
                icon={<ClipboardList className="w-5 h-5 text-primary" />}
                title="No hay registros en tu historial"
                description="Empezá registrando un síntoma, una vacuna o una cita. Pulso usa esta información para conocerte mejor."
              />
            )}

            {items.length > 0 && (
            <div className="space-y-1 pb-20 md:pb-0">
              {items.map((item, idx) => {
                const period = getPeriod(item.rawDate);
                const prevPeriod = idx > 0 ? getPeriod(items[idx - 1].rawDate) : null;
                const showPeriod = period !== prevPeriod;

                return (
                  <div key={`${item.type}-${item.id}`}>
                    {showPeriod && (
                      <div className="flex items-center gap-3 py-3">
                        <span className="text-xs font-bold text-gray tracking-widest">{periodLabel[period]}</span>
                        <div className="flex-1 h-px bg-gray/10" />
                      </div>
                    )}
                    <div
                      className="bg-surface rounded-card p-6 transition-all animate-fade-in-up cursor-pointer hover:ring-1 hover:ring-primary/20"
                      onClick={() => handleDetail(item.type, item.raw)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {(() => {
                            const Icon = typeIconComponent[item.type];
                            return (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold ${typeColors[item.type]}`}>
                                <Icon className="w-3 h-3" />
                                {typeLabel[item.type]}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditClick(item.type, item.raw)}
                            className="text-xs text-gray hover:text-primary font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ type: item.type, raw: item.raw })}
                            className="text-xs text-gray hover:text-danger font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Eliminar</span>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-text break-words">{item.title}</h3>
                      <p className="text-xs text-gray mt-1 break-words">
                        {getRelativeTime(item.rawDate)} · {getAbsoluteDate(item.rawDate, item.type)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </>
      )}

      {detail && <DetailView detail={detail} onClose={() => setDetail(null)} />}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo registro"
        size="sm"
      >
        <div className="flex gap-1 mb-5 bg-gray/10 rounded-button p-1 w-fit">
          {createTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setCreateTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
                createTab === t.key ? "bg-surface text-text shadow-xs" : "text-gray hover:text-text"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {createTab === "sintoma" && (
          <CreateSymptomForm
            onCreate={sym.add}
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        )}
        {createTab === "vacuna" && (
          <CreateVaccineForm
            onCreate={vac.add}
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        )}
        {createTab === "cita" && (
          <CreateAppointmentForm
            onCreate={appt.add}
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Editar ${typeLabel[editing?.type ?? "sintoma"].toLowerCase()}`}
        size="sm"
      >
        {editing && (
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                {editing.type === "vacuna" ? "Nombre de la vacuna" : "Descripción"} <span className="text-danger">*</span>
              </label>
              {editing.type === "vacuna" ? (
                <input
                  type="text"
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-button border bg-surface text-text text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
                  required
                />
              ) : (
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary resize-none"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                {editing.type === "cita" ? "Fecha y hora" : "Fecha"}
              </label>
              <input
                type={editing.type === "cita" ? "datetime-local" : "date"}
                value={editForm.fecha}
                onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                className="w-full px-4 py-2.5 rounded-button border bg-surface text-text text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="text-sm text-gray hover:text-text font-medium transition-colors cursor-pointer py-2.5 px-5">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !editForm.descripcion.trim()}
                className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar registro"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        confirmLoading={submitting}
      />

      {!showSkeleton && !errorInitial && (
        <button
          onClick={handleFabClick}
          className="fixed bottom-24 md:bottom-6 right-4 z-40 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Nuevo registro"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
