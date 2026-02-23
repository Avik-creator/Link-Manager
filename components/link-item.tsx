"use client"

import { useState } from "react"
import type { Link, Group } from "@/lib/types"
import { extractHostname, formatRelativeTime } from "@/lib/url"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { LinkPreviewCard } from "@/components/link-preview-card"
import {
  Trash2,
  ExternalLink,
  Globe,
  MoreHorizontal,
  FolderInput,
  FolderMinus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkItemProps {
  link: Link
  groups: Group[]
  onDelete: (id: string) => void
  onMoveToGroup: (linkId: string, groupId: string | undefined) => void
}

export function LinkItem({ link, groups, onDelete, onMoveToGroup }: LinkItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [faviconError, setFaviconError] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const hostname = extractHostname(link.url)
  const timeAgo = formatRelativeTime(link.createdAt)
  const currentGroup = groups.find((g) => g.id === link.groupId)

  return (
    <>
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
            {/* Favicon */}
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
                {currentGroup && (
                  <span
                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-foreground"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${currentGroup.color} 15%, transparent)`,
                      color: currentGroup.color,
                    }}
                  >
                    {currentGroup.name}
                  </span>
                )}
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

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open link in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Link actions"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {groups.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <FolderInput className="h-4 w-4" />
                        Move to group
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-44">
                        {groups.map((group) => (
                          <DropdownMenuItem
                            key={group.id}
                            onClick={() => onMoveToGroup(link.id, group.id)}
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: group.color }}
                            />
                            <span className="truncate">{group.name}</span>
                            {link.groupId === group.id && (
                              <span className="ml-auto text-xs text-muted-foreground">Current</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                        {link.groupId && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onMoveToGroup(link.id, undefined)}>
                              <FolderMinus className="h-4 w-4" />
                              Remove from group
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  {link.groupId && groups.length === 0 && (
                    <DropdownMenuItem onClick={() => onMoveToGroup(link.id, undefined)}>
                      <FolderMinus className="h-4 w-4" />
                      Remove from group
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" className="w-auto p-3">
          <LinkPreviewCard url={link.url} />
        </HoverCardContent>
      </HoverCard>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{link.title || hostname}</span>{" "}
              from your collection. This action syncs to all connected peers and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(link.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
