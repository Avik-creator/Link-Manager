"use client"

import { useState } from "react"
import type { Group } from "@/lib/types"
import { GROUP_COLORS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Inbox,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface GroupSidebarProps {
  groups: Group[]
  linkCountByGroup: Record<string, number>
  totalLinks: number
  ungroupedCount: number
  activeGroupId: string | null
  onSelectGroup: (groupId: string | null) => void
  onAddGroup: (name: string, color: string) => Group
  onUpdateGroup: (id: string, partial: Partial<Group>) => void
  onDeleteGroup: (id: string) => void
}

export function GroupSidebar({
  groups,
  linkCountByGroup,
  totalLinks,
  ungroupedCount,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: GroupSidebarProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(GROUP_COLORS[0].value)

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    onAddGroup(name, newColor)
    setNewName("")
    setNewColor(GROUP_COLORS[0].value)
    setCreateOpen(false)
  }

  const handleUpdate = () => {
    if (!editGroup) return
    const name = newName.trim()
    if (!name) return
    onUpdateGroup(editGroup.id, { name, color: newColor })
    setEditGroup(null)
    setNewName("")
  }

  const handleConfirmDelete = () => {
    if (!deleteGroup) return
    onDeleteGroup(deleteGroup.id)
    if (activeGroupId === deleteGroup.id) {
      onSelectGroup("all")
    }
    setDeleteGroup(null)
  }

  const openEdit = (group: Group) => {
    setNewName(group.name)
    setNewColor(group.color)
    setEditGroup(group)
  }

  return (
    <>
      <div className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Groups
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setNewName("")
              setNewColor(GROUP_COLORS[0].value)
              setCreateOpen(true)
            }}
            aria-label="Create group"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Filter list */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {/* All links */}
            <button
              onClick={() => onSelectGroup("all")}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                (activeGroupId === null || activeGroupId === "all")
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">All links</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                {totalLinks}
              </Badge>
            </button>

            {/* Ungrouped */}
            <button
              onClick={() => onSelectGroup("ungrouped")}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                activeGroupId === "ungrouped"
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Inbox className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">Ungrouped</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                {ungroupedCount}
              </Badge>
            </button>

            {groups.length > 0 && (
              <div className="mx-3 my-1.5 border-t border-border" />
            )}

            {/* Group items */}
            {groups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeGroupId === group.id
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <button
                  className="flex flex-1 items-center gap-2.5 min-w-0"
                  onClick={() => onSelectGroup(group.id)}
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="flex-1 truncate">{group.name}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                    {linkCountByGroup[group.id] || 0}
                  </Badge>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      aria-label={`Edit ${group.name}`}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => openEdit(group)}>
                      <Pencil className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteGroup(group)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={createOpen || !!editGroup}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditGroup(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editGroup ? "Edit Group" : "New Group"}</DialogTitle>
            <DialogDescription>
              {editGroup
                ? "Update the group name or color."
                : "Create a group to organize your links."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Work, Reading, Inspiration..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    editGroup ? handleUpdate() : handleCreate()
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      newColor === c.value
                        ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-105"
                    )}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.name}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false)
                setEditGroup(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editGroup ? handleUpdate : handleCreate}
              disabled={!newName.trim()}
            >
              {editGroup ? "Save Changes" : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteGroup} onOpenChange={(open) => !open && setDeleteGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the group{" "}
              <span className="font-medium text-foreground">
                {deleteGroup?.name}
              </span>
              . All links in this group will become ungrouped. This action syncs
              to all connected peers and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
