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
  const queue = useToastStore((s) => s.queue);
  const dismiss = useToastStore((s) => s.dismiss);

  if (queue.length === 0) return null;

  return createPortal(
    <div className="fixed top-[calc(77px+env(safe-area-inset-top))] md:top-4 right-4 z-[9999] flex flex-col-reverse gap-2">
      {queue.map((toast) => {
        const { icon } = config[toast.type];
        return (
          <div key={toast.id} className="animate-fade-in-up">
            <div className="flex items-start gap-3 px-4 py-3 rounded-button text-sm font-medium shadow-xl bg-surface">
              {icon}
              <span className="flex-1 text-text">{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                className="p-0.5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 text-gray" />
              </button>
            </div>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
