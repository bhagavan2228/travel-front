import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/50',
        className
      )}
      aria-hidden
    />
  )
}

export function DestinationCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}
