import { Calendar, Syringe, FileText, Check } from "lucide-react";
import Modal from "../ui/Modal";
import type { Reminder, ReminderTipo } from "../../types";

interface ReminderDetailModalProps {
  reminder: Reminder | null
  onClose: () => void
}

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

export default function ReminderDetailModal({ reminder, onClose }: ReminderDetailModalProps) {
  return (
    <Modal open={reminder !== null} onClose={onClose} title="Detalle de recordatorio" scrollable>
      {reminder && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold ${tipoBadge[reminder.tipo] || "bg-gray/10 text-gray"}`}>
              {(() => {
                const Icon = tipoIcon[reminder.tipo] || FileText;
                return <Icon className="w-3 h-3" />;
              })()}
              {tipoLabel[reminder.tipo]}
            </span>
            {reminder.leido && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold bg-gray/10 text-gray">
                <Check className="w-3 h-3" />
                Leído
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1">Título</label>
            <p className="text-text font-semibold">{reminder.titulo}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray mb-1">Descripción</label>
            <p className="text-sm text-text whitespace-pre-wrap">{reminder.descripcion || "Sin descripción"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Fecha</label>
              <p className="text-sm text-text">{formatDateTime(reminder.fecha)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Tipo</label>
              <p className="text-sm text-text capitalize">{tipoLabel[reminder.tipo]}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Creado</label>
              <p className="text-sm text-text">{formatDate(reminder.created_at)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray mb-1">Actualizado</label>
              <p className="text-sm text-text">{formatDate(reminder.updated_at)}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
