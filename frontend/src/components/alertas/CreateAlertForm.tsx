import type { AlertNivel } from "../../types";

interface CreateAlertFormProps {
  form: { titulo: string; descripcion: string; nivel: AlertNivel | ""; departamento: string; fuente: string }
  setForm: React.Dispatch<React.SetStateAction<{ titulo: string; descripcion: string; nivel: AlertNivel | ""; departamento: string; fuente: string }>>
  creating: boolean
  formDisabled: boolean
  onCreate: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const nivelesForm: { value: AlertNivel; label: string }[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

export default function CreateAlertForm({ form, setForm, creating, formDisabled, onCreate, onCancel, submitLabel = "Crear alerta" }: CreateAlertFormProps) {
  return (
    <form onSubmit={onCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Título <span className="text-danger">*</span></label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          placeholder="Ej: Alerta por dengue"
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Describe la alerta..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Nivel <span className="text-danger">*</span></label>
          <select
            value={form.nivel}
            onChange={(e) => setForm({ ...form, nivel: e.target.value as AlertNivel })}
            className="w-full rounded-button border border-gray/30 bg-surface px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            required
          >
            <option value="">Seleccionar nivel</option>
            {nivelesForm.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Departamento</label>
          <input
            type="text"
            value={form.departamento}
            onChange={(e) => setForm({ ...form, departamento: e.target.value })}
            placeholder="Ej: León"
            className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Fuente</label>
        <input
          type="text"
          value={form.fuente}
          onChange={(e) => setForm({ ...form, fuente: e.target.value })}
          placeholder="Ej: Ministerio de Salud Pública"
          className="w-full px-4 py-2.5 rounded-button border bg-surface text-text placeholder:text-gray text-sm focus:outline-none focus:ring-2 transition-all border-gray/30 focus:ring-primary/50 focus:border-primary"
        />
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
          {creating ? (submitLabel === "Guardar cambios" ? "Guardando..." : "Creando...") : submitLabel}
        </button>
      </div>
    </form>
  );
}
