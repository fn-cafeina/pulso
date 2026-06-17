import { AlertCircle, X } from "lucide-react";

interface AlertBannerProps {
  message: string
  onClose?: () => void
  onRetry?: () => void
}

export default function AlertBanner({ message, onClose, onRetry }: AlertBannerProps) {
  return (
    <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger rounded-button px-4 py-3 text-sm animate-shake" role="alert">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button onClick={onRetry} className="text-primary hover:text-primary-dark underline font-medium text-xs">
            Reintentar
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="text-danger/70 hover:text-danger transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
