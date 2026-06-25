import type { Reminder, ReminderTipo } from "../../types";

interface ReminderFormProps {
  form: { titulo: string; descripcion: string; fecha: string; tipo: ReminderTipo | "" }
  setForm: React.Dispatch<React.SetStateAction<{ titulo: string; descripcion: string; fecha: string; tipo: ReminderTipo | "" }>>
  editingReminder: Reminder | null
  creating: boolean
  updating: boolean
  formDisabled: boolean
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
}

export default function ReminderForm({ form, setForm, editingReminder, creating, updating, formDisabled, onSubmit, onCancel }: ReminderFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Título <span className="text-danger">*</span></label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          placeholder="Ej: Revisión con Dr. Pérez"
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Notas adicionales..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Fecha y hora <span className="text-danger">*</span></label>
        <input
          type="datetime-local"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          className="w-full rounded-button border border-gray/30 bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Tipo <span className="text-danger">*</span></label>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value as ReminderTipo })}
          className="w-full rounded-button border border-gray/30 bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          required
        >
          <option value="">Seleccionar tipo</option>
          <option value="cita">Cita médica</option>
          <option value="vacuna">Vacuna</option>
          <option value="manual">Manual</option>
        </select>
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
          {(creating || updating)
            ? (editingReminder ? "Guardando..." : "Creando...")
            : (editingReminder ? "Guardar cambios" : "Crear recordatorio")}
        </button>
      </div>
    </form>
  );
}
