import { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";
import type { AlertNivel } from "../../types";

interface AlertFiltersPopoverProps {
  nivel: string
  departamento: string
  onNivelChange: (nivel: string) => void
  onDepartamentoChange: (departamento: string) => void
  onClear: () => void
}

const nivelesForm: { value: AlertNivel; label: string }[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
  { value: "critico", label: "Crítico" },
];

export default function AlertFiltersPopover({ nivel, departamento, onNivelChange, onDepartamentoChange, onClear }: AlertFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const gap = 12;
      const overflow = rect.left + 224 + gap - window.innerWidth;
      setOffset(overflow > 0 ? -(overflow) : 0);
    }
  }, [open]);

  return (
    <div ref={popoverRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm font-medium transition-all cursor-pointer ${
          nivel || departamento ? "bg-primary/10 text-primary" : "text-gray hover:text-text bg-gray/10 hover:bg-gray/15"
        }`}
      >
        <Filter className="w-3.5 h-3.5" />
        Filtrar
      </button>
      {open && (
        <div className="absolute top-full mt-2 z-50 bg-surface rounded-card shadow-lg border border-gray/10 p-4 w-56 animate-scale-in" style={{ left: offset }}>
          <p className="text-xs font-semibold text-gray mb-2">Nivel</p>
          <div className="space-y-1 mb-4">
            <label className="flex items-center gap-2 px-2 py-1.5 rounded-button text-sm cursor-pointer hover:bg-gray/10 transition-colors">
              <input type="radio" name="nivel" checked={nivel === ""} onChange={() => onNivelChange("")} className="accent-primary" />
              <span className="text-text">Todos</span>
            </label>
            {nivelesForm.map((n) => (
              <label key={n.value} className="flex items-center gap-2 px-2 py-1.5 rounded-button text-sm cursor-pointer hover:bg-gray/10 transition-colors">
                <input type="radio" name="nivel" checked={nivel === n.value} onChange={() => onNivelChange(n.value)} className="accent-primary" />
                <span className="text-text">{n.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs font-semibold text-gray mb-2">Departamento</p>
          <input
            type="text"
            value={departamento}
            onChange={(e) => onDepartamentoChange(e.target.value)}
            placeholder="Ej: Managua, León..."
            className="w-full px-3 py-1.5 rounded-button border border-gray/30 bg-surface text-sm text-text placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          {(nivel || departamento) && (
            <button
              onClick={onClear}
              className="mt-3 text-xs text-danger hover:text-danger/80 font-medium transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
