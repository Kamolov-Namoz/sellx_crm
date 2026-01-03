'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function ClientCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function ClientListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ClientCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="card">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-12" />
      </div>
      <div className="card">
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-8 w-12" />
      </div>
    </div>
  );
}

export function ClientDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="card">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </div>
      <div className="card">
        <Skeleton className="h-5 w-20 mb-2" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-lg mt-6" />
    </div>
  );
}
