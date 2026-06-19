import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { useDelayedLoading } from "../../lib/useDelayedLoading";
import Modal from "../ui/Modal";
import SkeletonCard from "../ui/SkeletonCard";
import EmptyState from "../ui/EmptyState";
import AlertBanner from "../ui/AlertBanner";

interface ResourceSectionProps {
  title: string
  icon: ReactNode
  items: { id: number }[]
  loading: boolean
  error: string | null
  emptyTitle: string
  emptyDescription: string
  createLabel: string
  onRefresh: () => void
  onClearError: () => void
  renderCard: (item: { id: number }) => ReactNode
  renderCreateForm: (props: {
    onSuccess: () => void
    onCancel: () => void
  }) => ReactNode
}

export default function ResourceSection({
  title,
  icon,
  items,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  createLabel,
  onRefresh,
  onClearError,
  renderCard,
  renderCreateForm,
}: ResourceSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const loadingInitial = loading && items.length === 0;
  const showSkeleton = useDelayedLoading(loadingInitial);
  const errorInitial = error && items.length === 0 && !loading;

  return (
    <div className="transition-opacity duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h3 className="text-lg font-bold text-text">{title}</h3>
          {!loading && items.length > 0 && (
            <span className="text-sm text-gray ml-1">({items.length})</span>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">{createLabel}</span>
        </button>
      </div>

      {showSkeleton && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {errorInitial && (
        <>
          <AlertBanner message={error} onClose={onClearError} />
          <button
            onClick={onRefresh}
            className="mt-3 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-5 rounded-button transition-all cursor-pointer text-sm"
          >
            Reintentar
          </button>
        </>
      )}

      {!showSkeleton && !errorInitial && items.length === 0 && (
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
          action={{ label: createLabel, onClick: () => setShowForm(true) }}
        />
      )}

      {!showSkeleton && items.length > 0 && (
        <div className="space-y-3">
          {error && (
            <div className="mb-3">
              <AlertBanner message={error} onClose={onClearError} onRetry={onRefresh} />
            </div>
          )}
          {items.map((item) => (
            <div key={item.id}>{renderCard(item)}</div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={`Nuevo ${createLabel.toLowerCase()}`} size="sm">
        {renderCreateForm({
          onSuccess: () => setShowForm(false),
          onCancel: () => setShowForm(false),
        })}
      </Modal>
    </div>
  );
}
