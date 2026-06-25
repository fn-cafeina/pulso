import { Calendar, Syringe, FileText, Clock, Check, Pencil, Trash2 } from "lucide-react";
import type { Reminder, ReminderTipo } from "../../types";

interface ReminderCardProps {
  reminder: Reminder
  tab: "pendientes" | "historial"
  marking?: number | null
  onEdit: (reminder: Reminder) => void
  onMarkRead: (id: number) => void
  onDelete: (id: number) => void
  onClick: (reminder: Reminder) => void
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

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default function ReminderCard({ reminder, tab, marking, onEdit, onMarkRead, onDelete, onClick }: ReminderCardProps) {
  const TipoIcon = tipoIcon[reminder.tipo] || FileText;
  const badgeClass = tipoBadge[reminder.tipo] || "bg-gray/10 text-gray";
  const overdue = tab === "pendientes" && !reminder.leido && isOverdue(reminder.fecha);

  return (
    <div
      className={`bg-surface rounded-card p-6 transition-all animate-fade-in-up cursor-pointer hover:ring-1 hover:ring-primary/20 ${
        reminder.leido ? "opacity-70" : ""
      }`}
      onClick={() => onClick(reminder)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold ${badgeClass}`}>
            <TipoIcon className="w-3 h-3" />
            {tipoLabel[reminder.tipo]}
          </span>
          {overdue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold bg-danger/10 text-danger">
              <Clock className="w-3 h-3" />
              Vencido
            </span>
          )}
          {reminder.leido && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-button text-xs font-semibold bg-gray/10 text-gray">
              <Check className="w-3 h-3" />
              Leído
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!reminder.leido && (
            <button
              onClick={() => onEdit(reminder)}
              className="text-xs text-gray hover:text-primary font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Editar</span>
            </button>
          )}
          {tab === "pendientes" && !reminder.leido && (
            <button
              onClick={() => onMarkRead(reminder.id)}
              disabled={marking === reminder.id}
              className="text-xs text-gray hover:text-success font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Marcar leído"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{marking === reminder.id ? "..." : "Marcar leído"}</span>
            </button>
          )}
          <button
            onClick={() => onDelete(reminder.id)}
            className="text-xs text-gray hover:text-danger font-medium transition-colors cursor-pointer flex items-center gap-1"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Eliminar</span>
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-text mb-1">{reminder.titulo}</h3>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDateTime(reminder.fecha)}
        </span>
      </div>
    </div>
  );
}
