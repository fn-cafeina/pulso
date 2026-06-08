import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, Plus } from "lucide-react";
import { useAuthStore } from "../stores/auth";
import { useAlertsStore, deactivateAlert } from "../stores/alerts";
import type { AlertNivel } from "../types";

const niveles: { value: string; label: string }[] = [
  { value: "", label: "Todos los niveles" },
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

const nivelesForm: { value: AlertNivel; label: string }[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

const nivelColor: Record<AlertNivel, string> = {
  bajo: "success",
  medio: "warning",
  alto: "orange-500",
  critico: "danger",
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
}

function CreateForm({ form, setForm, creating, formDisabled, onCreate, onCancel }: CreateFormProps) {
  return (
    <form onSubmit={onCreate} className="bg-surface rounded-card shadow-sm p-6 border border-gray/10 space-y-4">
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
          {creating ? "Creando..." : "Crear alerta"}
        </button>
      </div>
    </form>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-card shadow-sm p-6 border border-gray/10 animate-pulse-gentle">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-14 bg-gray/20 rounded-button" />
      </div>
      <div className="h-4 bg-gray/20 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray/10 rounded w-full mb-1" />
      <div className="h-3 bg-gray/10 rounded w-2/3 mb-3" />
      <div className="flex gap-4">
        <div className="h-3 bg-gray/10 rounded w-24" />
        <div className="h-3 bg-gray/10 rounded w-20" />
      </div>
    </div>
  );
}

export default function AlertasPage() {
  const { rol } = useAuthStore();
  const { items, loading, error, fetch, add, clearError } = useAlertsStore();
  const [nivel, setNivel] = useState("");
  const [soloActivas, setSoloActivas] = useState(true);
  const [desactivando, setDesactivando] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", nivel: "" as AlertNivel | "", departamento: "", fuente: "" });

  useEffect(() => {
    const params: Record<string, any> = {};
    if (nivel) params.nivel = nivel;
    if (soloActivas) params.activas = true;
    fetch(params);
  }, [nivel, soloActivas, fetch]);

  async function handleDeactivate(id: number) {
    setDesactivando(id);
    try {
      await deactivateAlert(id);
    } finally {
      setDesactivando(null);
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
    } catch {
      // error handled by store
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setShowForm(false);
    setForm({ titulo: "", descripcion: "", nivel: "", departamento: "", fuente: "" });
  }

  const formDisabled = creating || !form.titulo || !form.nivel;

  if (loading && items.length === 0) {
    return (
      <div className="py-4 md:py-6 px-4 md:px-8 space-y-4">
        <div className="h-8 bg-gray/20 rounded w-48 animate-pulse-gentle" />
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="py-4 md:py-6 px-4 md:px-8">
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger rounded-button px-4 py-3 text-sm animate-shake" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="text-danger/70 hover:text-danger underline font-medium">Cerrar</button>
        </div>
        <button
          onClick={() => fetch()}
          className="mt-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-button transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="py-4 md:py-6 px-4 md:px-8 flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-xl mb-6 animate-float">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">No hay alertas</h2>
        <p className="text-gray max-w-md">No hay alertas epidemiológicas en este momento.</p>
        {rol === "health_worker" && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear alerta
          </button>
        )}
        {showForm && rol === "health_worker" && (
          <div className="w-full max-w-lg mt-6">
            <CreateForm form={form} setForm={setForm} creating={creating} formDisabled={formDisabled} onCreate={handleCreate} onCancel={resetForm} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      <h2 className="text-2xl font-bold text-text mb-4">Alertas Epidemiológicas</h2>

      {rol === "health_worker" && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear alerta
        </button>
      )}

      {showForm && rol === "health_worker" && (
        <div className="mb-4">
          <CreateForm form={form} setForm={setForm} creating={creating} formDisabled={formDisabled} onCreate={handleCreate} onCancel={resetForm} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          className="rounded-button border border-gray/30 bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          {niveles.map((n) => (
            <option key={n.value} value={n.value}>{n.label}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
          <input
            type="checkbox"
            checked={soloActivas}
            onChange={(e) => setSoloActivas(e.target.checked)}
            className="accent-primary w-4 h-4 rounded border-gray/30"
          />
          Solo activas
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger rounded-button px-4 py-3 text-sm animate-shake mb-4" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="text-danger/70 hover:text-danger underline font-medium">Cerrar</button>
        </div>
      )}

      {loading && (
        <div className="mb-2 text-sm text-gray">Actualizando...</div>
      )}

      <div className="space-y-3">
        {items.map((alert) => {
          const color = nivelColor[alert.nivel] || "gray";
          return (
            <div
              key={alert.id}
              className={`bg-surface rounded-card shadow-sm p-6 border border-gray/10 transition-all ${!alert.activa ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-semibold bg-${color}/10 text-${color}`}>
                    {alert.nivel}
                  </span>
                  {!alert.activa && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-semibold bg-gray/10 text-gray">
                      Inactiva
                    </span>
                  )}
                </div>
                {rol === "health_worker" && alert.activa && (
                  <button
                    onClick={() => handleDeactivate(alert.id)}
                    disabled={desactivando === alert.id}
                    className="text-xs text-gray hover:text-danger font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {desactivando === alert.id ? "Desactivando..." : "Desactivar"}
                  </button>
                )}
              </div>

              <h3 className="font-semibold text-text mb-1">{alert.titulo}</h3>
              <p className="text-sm text-gray mb-3">{alert.descripcion}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray">
                {alert.departamento && <span>Departamento: {alert.departamento}</span>}
                {alert.fuente && <span>Fuente: {alert.fuente}</span>}
                <span>{formatDate(alert.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
