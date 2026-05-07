import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { AppSkeletonProps } from "./AppSkeleton.interface"

const AppSkeleton = (props: AppSkeletonProps) => {
  const {
    className,
    itemClassName,
    count = 1,
    withoutMargin = false,
  } = props

  const safeCount = Math.max(1, count)

  return (
    <div className={cn("space-y-2", withoutMargin ? "" : "mb-4", className)}>
      {Array.from({ length: safeCount }, (_, index) => (
        <Skeleton
          key={`app-skeleton-${index}`}
          className={cn("h-5 w-full", itemClassName)}
        />
      ))}
    </div>
  )
}

export default AppSkeleton
