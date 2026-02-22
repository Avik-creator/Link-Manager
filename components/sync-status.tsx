"use client"

import type { SyncState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Loader2, Check, AlertCircle, Minus } from "lucide-react"

interface SyncStatusProps {
  syncState: SyncState
  peerCount: number
}

export function SyncStatus({ syncState, peerCount }: SyncStatusProps) {
  const iconMap = {
    syncing: <Loader2 className="h-3.5 w-3.5 animate-spin text-chart-1" />,
    synced: <Check className="h-3.5 w-3.5 text-emerald-500" />,
    error: <AlertCircle className="h-3.5 w-3.5 text-destructive" />,
    idle: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
  }

  const labelMap = {
    syncing: "Syncing...",
    synced: `Synced${peerCount > 0 ? ` (${peerCount})` : ""}`,
    error: "Sync error",
    idle: peerCount > 0 ? `${peerCount} peer${peerCount > 1 ? "s" : ""}` : "No peers",
  }

  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-live="polite"
    >
      {iconMap[syncState]}
      <span
        className={cn(
          "text-xs",
          syncState === "synced" ? "text-emerald-500" : "text-muted-foreground"
        )}
      >
        {labelMap[syncState]}
      </span>
    </div>
  )
}
