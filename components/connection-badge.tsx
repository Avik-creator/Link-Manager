"use client"

import { useOfflineStatus } from "@/hooks/use-offline-status"
import { cn } from "@/lib/utils"

export function ConnectionBadge() {
  const { isOnline } = useOfflineStatus()

  return (
    <div className="flex items-center gap-1.5" role="status" aria-live="polite">
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          isOnline ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
        )}
      />
      <span className="text-xs text-muted-foreground">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  )
}
