import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  confirmLoading?: boolean
  variant?: "danger" | "primary"
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  confirmLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  const btnClass =
    variant === "danger"
      ? "bg-danger hover:bg-danger/80 disabled:opacity-50 text-white"
      : "bg-primary hover:bg-primary-dark disabled:opacity-50 text-white";

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="text-sm text-gray hover:text-text font-medium transition-colors cursor-pointer py-2.5 px-5"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={confirmLoading}
          className={`${btnClass} font-semibold py-2.5 px-5 rounded-button transition-all cursor-pointer disabled:cursor-not-allowed`}
        >
          {confirmLoading ? `${confirmLabel}...` : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
