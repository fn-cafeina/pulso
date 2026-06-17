interface SkeletonCardProps {
  lines?: number
}

export default function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="bg-surface rounded-card p-6 animate-pulse-gentle">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-14 bg-gray/20 rounded-button" />
      </div>
      <div className="h-4 bg-gray/20 rounded w-3/4 mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-gray/10 rounded mb-1 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
      <div className="flex gap-4 mt-2">
        <div className="h-3 bg-gray/10 rounded w-24" />
      </div>
    </div>
  );
}
