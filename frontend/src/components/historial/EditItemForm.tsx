import Modal from "../ui/Modal";
import type { SymptomReport, VaccinationRecord, Appointment } from "../../types";

type CreateTab = "sintoma" | "vacuna" | "cita";

interface DetailData {
  type: CreateTab
  raw: SymptomReport | VaccinationRecord | Appointment
}

interface EditItemFormProps {
  editing: DetailData | null
  editForm: { descripcion: string; fecha: string }
  setEditForm: React.Dispatch<React.SetStateAction<{ descripcion: string; fecha: string }>>
  submitting: boolean
  onSave: (e: React.FormEvent) => Promise<void>
  onClose: () => void
}

const typeLabel: Record<CreateTab, string> = {
  sintoma: "Síntoma",
  vacuna: "Vacuna",
  cita: "Cita",
};

export default function EditItemForm({ editing, editForm, setEditForm, submitting, onSave, onClose }: EditItemFormProps) {
  return (
    <Modal
      open={editing !== null}
      onClose={onClose}
      title={`Editar ${typeLabel[editing?.type ?? "sintoma"].toLowerCase()}`}
      size="sm"
    >
      {editing && (
        <form onSubmit={onSave} className="space-y-4">
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
            <button type="button" onClick={onClose} className="text-sm text-gray hover:text-text font-medium transition-colors cursor-pointer py-2.5 px-5">
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
  );
}
