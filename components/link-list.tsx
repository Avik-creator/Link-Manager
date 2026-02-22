"use client"

import { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { Link } from "@/lib/types"
import { LinkItem } from "@/components/link-item"
import { Link as LinkIcon } from "lucide-react"

interface LinkListProps {
  links: Link[]
  isLoaded: boolean
  onDeleteLink: (id: string) => void
}

/**
 * Virtualized link list using @tanstack/react-virtual.
 * Only renders visible rows for performance with large collections.
 */
export function LinkList({ links, isLoaded, onDeleteLink }: LinkListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: links.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 10,
  })

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading links...</p>
        </div>
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <LinkIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              No links yet
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-balance">
              Paste a URL above to save your first link. Links sync
              automatically with connected peers.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="flex-1 overflow-auto">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const link = links[virtualItem.index]
          return (
            <div
              key={link.id}
              className="absolute left-0 top-0 w-full"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <LinkItem link={link} onDelete={onDeleteLink} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
