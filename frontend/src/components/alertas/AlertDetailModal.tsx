import Modal from "../ui/Modal";
import type { AlertNivel, EpiAlert } from "../../types";

interface AlertDetailModalProps {
  alert: EpiAlert | null
  onClose: () => void
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

export default function AlertDetailModal({ alert, onClose }: AlertDetailModalProps) {
  return (
    <Modal open={alert !== null} onClose={onClose} title="Detalle de alerta" scrollable>
      {alert && (
        <div className="space-y-4">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-semibold ${alert.activa ? nivelBadge[alert.nivel] || "bg-gray/10 text-gray" : "bg-gray/10 text-gray"}`}>
              {alert.activa ? alert.nivel : "Inactiva"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1">Título</label>
            <p className="text-text font-semibold">{alert.titulo}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1">Descripción</label>
            <p className="text-sm text-text whitespace-pre-wrap">{alert.descripcion || "Sin descripción"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Nivel</label>
              <p className="text-sm text-text capitalize">{alert.nivel}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Estado</label>
              <p className="text-sm text-text">{alert.activa ? "Activa" : "Inactiva"}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Departamento</label>
              <p className="text-sm text-text">{alert.departamento || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Fuente</label>
              <p className="text-sm text-text">{alert.fuente || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Creada</label>
              <p className="text-sm text-text">{formatDate(alert.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Actualizada</label>
              <p className="text-sm text-text">{formatDate(alert.updated_at)}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
