import Modal from "../ui/Modal";
import type { SymptomReport, VaccinationRecord, Appointment } from "../../types";

type CreateTab = "sintoma" | "vacuna" | "cita";

interface DetailData {
  type: CreateTab
  raw: SymptomReport | VaccinationRecord | Appointment
}

const typeLabel: Record<CreateTab, string> = {
  sintoma: "Síntoma",
  vacuna: "Vacuna",
  cita: "Cita",
};

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

export default function DetailView({ detail, onClose }: { detail: DetailData | null; onClose: () => void }) {
  if (!detail) return null;
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
