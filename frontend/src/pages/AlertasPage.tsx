import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
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
  const { items, loading, error, fetch, clearError } = useAlertsStore();
  const [nivel, setNivel] = useState("");
  const [soloActivas, setSoloActivas] = useState(true);
  const [desactivando, setDesactivando] = useState<number | null>(null);

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
        <p className="text-gray max-w-md">No hay alertas epidemiológicas activas en este momento.</p>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 px-4 md:px-8">
      <h2 className="text-2xl font-bold text-text mb-4">Alertas Epidemiológicas</h2>

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
