/**
 * DocumentListSkeleton Component
 *
 * Loading skeleton for document list that matches the actual list item shape
 */

import { Skeleton } from "./Skeleton";

interface DocumentListSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
}

export function DocumentListSkeleton({ count = 3 }: DocumentListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <DocumentItemSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Single document list item skeleton
 */
function DocumentItemSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Document info */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />

          {/* Metadata row */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * DocumentDetailSkeleton Component
 *
 * Loading skeleton for document detail view
 */
export function DocumentDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Content section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * DocumentCardSkeleton Component
 *
 * Loading skeleton for document cards (grid view)
 */
export function DocumentCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 bg-white space-y-3"
        >
          {/* Icon/Preview */}
          <Skeleton className="h-32 w-full rounded-md" />

          {/* Title */}
          <Skeleton className="h-5 w-4/5" />

          {/* Metadata */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
