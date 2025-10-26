/**
 * Base Skeleton Component
 *
 * Reusable skeleton component with pulsing animation
 */

import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      style={style}
    />
  );
}
