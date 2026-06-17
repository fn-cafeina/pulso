import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  itemLabel,
  onPrev,
  onNext,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 pb-2 text-sm text-gray">
      <span>
        Página {page} de {totalPages} ({totalItems} {itemLabel})
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-button border border-gray/30 bg-surface text-text hover:bg-gray/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer disabled:cursor-not-allowed text-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-button border border-gray/30 bg-surface text-text hover:bg-gray/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer disabled:cursor-not-allowed text-sm"
        >
          Siguiente
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
