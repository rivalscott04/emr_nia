import { Skeleton } from "../ui/skeleton"

interface DataTableSkeletonProps {
  rows?: number
  hasSearch?: boolean
}

export function PageHeaderSkeleton({ hasAction = true }: { hasAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {hasAction && <Skeleton className="h-10 w-40" />}
    </div>
  )
}

export function DataTableSkeleton({
  rows = 6,
  hasSearch = true,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2 py-2 sm:gap-4">
        {hasSearch && <Skeleton className="h-10 w-full max-w-sm sm:w-48" />}
        <Skeleton className="h-10 w-28 sm:ml-auto sm:w-24" />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 py-2">
        <Skeleton className="h-4 w-52" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-60 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}
