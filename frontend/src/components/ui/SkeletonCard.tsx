export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded-lg w-1/3" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-4 skeleton rounded-lg w-4/5" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 skeleton rounded-full" />
          ))}
        </div>
        <div className="h-6 skeleton rounded-lg w-1/4" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {[...Array(count)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}
