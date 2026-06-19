import { useState } from "react";
import { useToastStore } from "../../stores/toast";
import type { Appointment } from "../../types";

interface Props {
  onCreate: (data: Record<string, unknown>) => Promise<Appointment>
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateAppointmentForm({ onCreate, onSuccess, onCancel }: Props) {
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fecha || !descripcion.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ fecha: new Date(fecha).toISOString(), descripcion: descripcion.trim() });
      useToastStore.getState().add("Cita agendada");
      onSuccess();
    } catch {
      useToastStore.getState().add("Error al crear cita", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Fecha y hora <span className="text-danger">*</span></label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Descripción <span className="text-danger">*</span></label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Control general"
          rows={3}
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary resize-none"
          required
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="text-sm text-gray hover:text-text font-medium transition-colors cursor-pointer py-2.5 px-5">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !fecha || !descripcion.trim()}
          className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? "Agendando..." : "Agendar cita"}
        </button>
      </div>
    </form>
  );
}
