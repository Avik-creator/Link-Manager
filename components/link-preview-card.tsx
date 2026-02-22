"use client"

import { useState } from "react"
import { usePreview } from "@/hooks/use-preview"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe } from "lucide-react"

interface LinkPreviewCardProps {
  url: string
}

/**
 * Rich hover preview card that shows OG image, title, description,
 * favicon and hostname for a given URL. Includes skeleton loading
 * and graceful fallback states.
 */
export function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const { preview, isLoading } = usePreview(url)
  const [imageError, setImageError] = useState(false)
  const [faviconError, setFaviconError] = useState(false)

  if (isLoading) {
    return (
      <div className="flex w-72 flex-col gap-3">
        <Skeleton className="h-36 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    )
  }

  if (!preview || (!preview.title && !preview.description && !preview.image)) {
    return (
      <div className="flex w-72 flex-col items-center gap-2 py-4">
        <Globe className="h-8 w-8 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">No preview available</p>
      </div>
    )
  }

  return (
    <div className="flex w-72 flex-col gap-2.5">
      {preview.image && !imageError && (
        <div className="relative h-36 w-full overflow-hidden rounded-md bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt={preview.title || "Link preview"}
            className="h-full w-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      {preview.title && (
        <h4 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
          {preview.title}
        </h4>
      )}
      {preview.description && (
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {preview.description}
        </p>
      )}
      <div className="flex items-center gap-1.5">
        {preview.favicon && !faviconError && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={preview.favicon}
            alt=""
            className="h-3.5 w-3.5 rounded-sm"
            onError={() => setFaviconError(true)}
          />
        )}
        <span className="truncate text-xs text-muted-foreground">
          {preview.hostname}
        </span>
      </div>
    </div>
  )
}
