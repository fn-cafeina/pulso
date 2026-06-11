import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useToastStore } from "../../stores/toast";
import type { ToastType } from "../../stores/toast";

const config: Record<ToastType, { icon: React.ReactNode }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-success" />,
  },
  info: {
    icon: <Info className="w-5 h-5 flex-shrink-0 text-info" />,
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 flex-shrink-0 text-danger" />,
  },
};

export default function ToastContainer() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!current) return null;

  const { icon } = config[current.type];

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] animate-fade-in-up">
      <div className="flex items-start gap-3 px-4 py-3 rounded-button text-sm font-medium shadow-xl bg-surface">
        {icon}
        <span className="flex-1 text-text">{current.message}</span>
        <button
          onClick={dismiss}
          className="p-0.5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 text-gray" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
