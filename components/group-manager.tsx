"use client"

import { useState } from "react"
import type { Group } from "@/lib/types"
import { GROUP_COLORS } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Plus, Pencil, Trash2, Check, X, FolderOpen } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface GroupManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: Group[]
  onAddGroup: (name: string, color: string) => Group
  onUpdateGroup: (id: string, partial: Partial<Group>) => void
  onDeleteGroup: (id: string) => void
}

export function GroupManager({
  open,
  onOpenChange,
  groups,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: GroupManagerProps) {
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(GROUP_COLORS[5].value) // Blue default
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    if (groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Group already exists")
      return
    }
    onAddGroup(name, newColor)
    setNewName("")
    setNewColor(GROUP_COLORS[5].value)
    toast.success(`Group "${name}" created`)
  }

  const startEdit = (group: Group) => {
    setEditingId(group.id)
    setEditName(group.name)
    setEditColor(group.color)
  }

  const saveEdit = () => {
    if (!editingId) return
    const name = editName.trim()
    if (!name) return
    onUpdateGroup(editingId, { name, color: editColor })
    setEditingId(null)
    toast.success("Group updated")
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    onDeleteGroup(deleteTarget.id)
    setDeleteTarget(null)
    toast.success(`Group "${deleteTarget.name}" deleted`)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Groups</DialogTitle>
            <DialogDescription>
              Create, rename, or delete groups to organize your links. Deleting a group ungroups its links.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Create new group */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                New Group
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate()
                  }}
                  placeholder="Group name..."
                  className="flex-1 text-sm"
                />
                <ColorPicker value={newColor} onChange={setNewColor} />
                <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>

            {groups.length > 0 && <Separator />}

            {/* Existing groups */}
            {groups.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Groups ({groups.length})
                </label>
                <div className="flex flex-col gap-1 max-h-64 overflow-auto">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                    >
                      {editingId === group.id ? (
                        <>
                          <ColorPicker value={editColor} onChange={setEditColor} />
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            className="flex-1 h-7 text-sm"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={saveEdit}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="flex-1 truncate text-sm font-medium text-foreground">
                            {group.name}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit(group)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(group)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groups.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No groups yet. Create one above to start organizing your links.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete group confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the group{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              . All links in this group will become ungrouped. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      {GROUP_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={cn(
            "h-5 w-5 rounded-full transition-all",
            value === c.value
              ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
              : "hover:scale-110"
          )}
          style={{ backgroundColor: c.value }}
          aria-label={c.name}
          title={c.name}
        />
      ))}
    </div>
  )
}
