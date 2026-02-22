"use client"

import { useState } from "react"
import type { Link } from "@/lib/types"
import { extractHostname, formatRelativeTime } from "@/lib/url"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import { LinkPreviewCard } from "@/components/link-preview-card"
import { Trash2, ExternalLink, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkItemProps {
  link: Link
  onDelete: (id: string) => void
}

export function LinkItem({ link, onDelete }: LinkItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [faviconError, setFaviconError] = useState(false)
  const hostname = extractHostname(link.url)
  const timeAgo = formatRelativeTime(link.createdAt)

  return (
    <HoverCard openDelay={400} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "group flex h-full cursor-default items-center gap-3 border-b border-border px-5 py-3 transition-colors",
            isHovered && "bg-accent/60"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Favicon -- uses React state for error handling, no innerHTML */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            {link.favicon && !faviconError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={link.favicon}
                alt=""
                className="h-4 w-4 rounded-sm"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {link.title || hostname}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="max-w-[300px] truncate text-xs text-muted-foreground">
                {link.url}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground/60">
                {timeAgo}
              </span>
            </div>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open link in new tab"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(link.id)
              }}
              aria-label="Delete link"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-auto p-3">
        <LinkPreviewCard url={link.url} />
      </HoverCardContent>
    </HoverCard>
  )
}
