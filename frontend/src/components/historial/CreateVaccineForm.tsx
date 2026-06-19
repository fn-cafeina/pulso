import { useState } from "react";
import { useToastStore } from "../../stores/toast";
import type { VaccinationRecord } from "../../types";

interface Props {
  onCreate: (data: Record<string, unknown>) => Promise<VaccinationRecord>
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateVaccineForm({ onCreate, onSuccess, onCancel }: Props) {
  const [nombreVacuna, setNombreVacuna] = useState("");
  const [fechaAplicacion, setFechaAplicacion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreVacuna.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ nombre_vacuna: nombreVacuna.trim(), fecha_aplicacion: fechaAplicacion || undefined });
      useToastStore.getState().add("Vacuna registrada");
      onSuccess();
    } catch {
      useToastStore.getState().add("Error al registrar vacuna", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Nombre de la vacuna <span className="text-danger">*</span></label>
        <input
          type="text"
          value={nombreVacuna}
          onChange={(e) => setNombreVacuna(e.target.value)}
          placeholder="Ej: Influenza"
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Fecha de aplicación</label>
        <input
          type="date"
          value={fechaAplicacion}
          onChange={(e) => setFechaAplicacion(e.target.value)}
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="text-sm text-gray hover:text-text font-medium transition-colors cursor-pointer py-2.5 px-5">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !nombreVacuna.trim()}
          className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? "Registrando..." : "Registrar vacuna"}
        </button>
      </div>
    </form>
  );
}
