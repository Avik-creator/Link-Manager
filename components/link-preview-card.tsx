"use client"

import { useState, useCallback } from "react"
import { usePreview } from "@/hooks/use-preview"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkPreviewCardProps {
  url: string
}

/**
 * Rich preview card that shows OG image, title, description,
 * favicon and hostname for a given URL. Includes skeleton loading
 * with smooth image fade-in and graceful fallback states.
 */
export function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const { preview, isLoading } = usePreview(url)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [faviconError, setFaviconError] = useState(false)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="flex flex-col gap-2 px-0.5">
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/5 rounded" />
          <div className="mt-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!preview || (!preview.title && !preview.description && !preview.image)) {
    return (
      <div className="flex w-full flex-col items-center gap-3 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Globe className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No preview available</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {/* OG Image with smooth fade-in */}
      {preview.image && !imageError && (
        <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt={preview.title || "Link preview"}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 px-0.5">
        {preview.title && (
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {preview.title}
          </h4>
        )}
        {preview.description && (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {preview.description}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {preview.favicon && !faviconError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview.favicon}
                alt=""
                className="h-4 w-4 shrink-0 rounded-sm"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            )}
            <span className="truncate text-xs text-muted-foreground">
              {preview.hostname}
            </span>
          </div>
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/40" />
        </div>
      </div>
    </div>
  )
}
