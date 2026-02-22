'use client'

import { useState } from 'react'
import type { Link } from '@/lib/types'
import { extractHostname, formatRelativeTime } from '@/lib/url'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card'
import { LinkPreviewCard } from '@/components/link-preview-card'
import { Trash2, ExternalLink, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LinkItemProps {
  link: Link
  onDelete: (id: string) => void
}

export function LinkItem({ link, onDelete }: LinkItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const hostname = extractHostname(link.url)
  const timeAgo = formatRelativeTime(link.createdAt)

  return (
    <HoverCard openDelay={400} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'group flex items-center gap-3 px-5 py-3 border-b border-border transition-colors cursor-default h-full',
            isHovered && 'bg-accent/60'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Favicon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            {link.favicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={link.favicon}
                alt=""
                className="h-4 w-4 rounded-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML =
                      '<svg class="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
                  }
                }}
              />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {link.title || hostname}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                {link.url}
              </span>
              <span className="text-[11px] text-muted-foreground/60 shrink-0">
                {timeAgo}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open link in new tab"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
