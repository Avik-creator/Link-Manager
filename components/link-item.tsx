"use client"

import React, { useState, useRef, useEffect } from "react"
import type { Link, Group } from "@/lib/types"
import { extractHostname, formatRelativeTime } from "@/lib/url"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
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
import { Textarea } from "@/components/ui/textarea"
import { LinkPreviewCard } from "@/components/link-preview-card"
import {
  Trash2,
  ExternalLink,
  Globe,
  MoreHorizontal,
  FolderInput,
  FolderMinus,
  Pencil,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkItemProps {
  link: Link
  groups: Group[]
  onDelete: (id: string) => void
  onMoveToGroup: (linkId: string, groupId: string | undefined) => void
  onUpdateLink: (id: string, partial: Partial<Link>) => void
  deviceId: string
}

export function LinkItem({
  link,
  groups,
  onDelete,
  onMoveToGroup,
  onUpdateLink,
  deviceId,
}: LinkItemProps) {
  const isOwner = !link.ownerId || link.ownerId === deviceId
  const [isHovered, setIsHovered] = useState(false)
  const [faviconError, setFaviconError] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [descDraft, setDescDraft] = useState(link.userDescription || "")
  const descRef = useRef<HTMLTextAreaElement>(null)
  const hostname = extractHostname(link.url)
  const timeAgo = formatRelativeTime(link.createdAt)
  const currentGroup = groups.find((g) => g.id === link.groupId)

  useEffect(() => {
    if (editingDescription && descRef.current) {
      descRef.current.focus()
    }
  }, [editingDescription])

  return (
    <React.Fragment>
      <div
        className={cn(
          "group flex cursor-default items-center gap-2 border-b border-border px-3 py-2.5 transition-colors sm:gap-3 sm:px-5 sm:py-3",
          isHovered && "bg-accent/60"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Favicon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-9 sm:w-9">
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

      {/* Preview Hover Card */}
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className="flex-1 min-w-0 cursor-default">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {link.title || hostname}
              </span>
              {currentGroup && (
                <span
                  className="hidden items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex"
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
              <span className="truncate text-xs text-muted-foreground">
                {link.url}
              </span>
              <span className="hidden shrink-0 text-[11px] text-muted-foreground/60 sm:inline">
                {timeAgo}
              </span>
            </div>
            {link.userDescription && !editingDescription && (
              <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed italic">
                {link.userDescription}
              </p>
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="center"
          sideOffset={8}
          className="w-80 p-0 overflow-hidden"
        >
          <div className="p-3">
            <LinkPreviewCard url={link.url} />
          </div>
          <div className="flex items-center justify-between border-t border-border px-3 py-2 bg-muted/30">
            <span className="truncate text-xs text-muted-foreground max-w-[180px]">
              {link.url}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 gap-1 text-xs shrink-0"
              asChild
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {"Open"}
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
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
              <DropdownMenuItem
                onClick={() => {
                  setDescDraft(link.userDescription || "")
                  setEditingDescription(true)
                }}
              >
                {link.userDescription ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    {"Edit note"}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    {"Add note"}
                  </>
                )}
              </DropdownMenuItem>
              {groups.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderInput className="h-4 w-4" />
                    {"Move to group"}
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
                          <span className="ml-auto text-xs text-muted-foreground">
                            {"Current"}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    {link.groupId && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onMoveToGroup(link.id, undefined)}
                        >
                          <FolderMinus className="h-4 w-4" />
                          {"Remove from group"}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {link.groupId && groups.length === 0 && (
                <DropdownMenuItem
                  onClick={() => onMoveToGroup(link.id, undefined)}
                >
                  <FolderMinus className="h-4 w-4" />
                  {"Remove from group"}
                </DropdownMenuItem>
              )}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {"Delete link"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Inline note editor */}
      {editingDescription && (
        <div className="border-b border-border bg-muted/30 px-3 py-2.5 sm:px-5 sm:py-3">
          <Textarea
            ref={descRef}
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            placeholder="Write a note about this link..."
            className="min-h-[56px] resize-none bg-background text-sm border-border"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                onUpdateLink(link.id, {
                  userDescription: descDraft.trim() || undefined,
                })
                setEditingDescription(false)
              }
              if (e.key === "Escape") {
                setEditingDescription(false)
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {"Ctrl+Enter to save \u00B7 Esc to cancel"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setEditingDescription(false)}
              >
                {"Cancel"}
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  onUpdateLink(link.id, {
                    userDescription: descDraft.trim() || undefined,
                  })
                  setEditingDescription(false)
                }}
              >
                {"Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{"Delete this link?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {"This will permanently remove "}
              <span className="font-medium text-foreground">
                {link.title || hostname}
              </span>
              {" from your collection. This action syncs to all connected peers and cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(link.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {"Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  )
}
