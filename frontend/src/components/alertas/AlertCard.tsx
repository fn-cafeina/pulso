import { Ban, Pencil, Trash2 } from "lucide-react";
import type { AlertNivel, EpiAlert, UserRol } from "../../types";

interface AlertCardProps {
  alert: EpiAlert
  rol?: UserRol
  onViewDetail: (alert: EpiAlert) => void
  onEdit: (alert: EpiAlert) => void
  onDeactivate: (id: number) => void
  onDelete: (id: number) => void
}

const nivelBadge: Record<AlertNivel, string> = {
  bajo: "bg-success/10 text-success",
  medio: "bg-warning/10 text-warning",
  alto: "bg-high/10 text-high",
  critico: "bg-danger/10 text-danger",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AlertCard({ alert, rol, onViewDetail, onEdit, onDeactivate, onDelete }: AlertCardProps) {
  return (
    <div
      className="bg-surface rounded-card p-6 transition-all animate-fade-in-up cursor-pointer hover:ring-1 hover:ring-primary/20"
      onClick={() => onViewDetail(alert)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-semibold ${nivelBadge[alert.nivel] || "bg-gray/10 text-gray"}`}>
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
                  onClick={() => onDeactivate(alert.id)}
                  className="text-xs text-gray hover:text-danger font-medium transition-colors cursor-pointer flex items-center gap-1"
                  title="Desactivar"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Desactivar</span>
                </button>
                <button
                  onClick={() => onEdit(alert)}
                  className="text-xs text-gray hover:text-primary font-medium transition-colors cursor-pointer flex items-center gap-1"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Editar</span>
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(alert.id)}
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
}
