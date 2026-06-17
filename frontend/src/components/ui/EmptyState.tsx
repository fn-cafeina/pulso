import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center animate-fade-in-up">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-text mb-1">{title}</h2>
      <p className="text-sm text-gray max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-primary hover:text-primary-dark font-medium underline transition-colors cursor-pointer text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
