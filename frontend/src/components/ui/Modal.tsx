import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: "sm" | "lg"
  scrollable?: boolean
}

export default function Modal({ open, onClose, title, children, size = "lg", scrollable = false }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className={`relative bg-surface rounded-card shadow-xl w-full animate-scale-in ${
          scrollable ? "max-h-[85vh] overflow-y-auto" : ""
        } ${size === "sm" ? "max-w-sm" : "max-w-lg"} p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray hover:text-text hover:bg-gray/10 rounded-button transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
