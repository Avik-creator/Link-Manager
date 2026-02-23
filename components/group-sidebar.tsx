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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuAction,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Plus,
  Inbox,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
  Link as LinkIcon,
  FolderPlus,
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
  isLoaded: boolean
  linkCount: number
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
  isLoaded,
  linkCount,
}: GroupSidebarProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [deleteGroupState, setDeleteGroupState] = useState<Group | null>(null)
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
    if (!deleteGroupState) return
    onDeleteGroup(deleteGroupState.id)
    if (activeGroupId === deleteGroupState.id) {
      onSelectGroup("all")
    }
    setDeleteGroupState(null)
  }

  const openEdit = (group: Group) => {
    setNewName(group.name)
    setNewColor(group.color)
    setEditGroup(group)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* App branding header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent active:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LinkIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">LinkDrop</span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {isLoaded ? `${linkCount} link${linkCount !== 1 ? "s" : ""}` : "Loading..."}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeGroupId === null || activeGroupId === "all"}
                  onClick={() => onSelectGroup("all")}
                  tooltip="All links"
                >
                  <Layers className="size-4" />
                  <span>All links</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>{totalLinks}</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeGroupId === "ungrouped"}
                  onClick={() => onSelectGroup("ungrouped")}
                  tooltip="Ungrouped"
                >
                  <Inbox className="size-4" />
                  <span>Ungrouped</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>{ungroupedCount}</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Groups */}
        <SidebarGroup>
          <SidebarGroupLabel>Groups</SidebarGroupLabel>
          <SidebarGroupAction
            title="Create group"
            onClick={() => {
              setNewName("")
              setNewColor(GROUP_COLORS[0].value)
              setCreateOpen(true)
            }}
          >
            <Plus className="size-4" />
            <span className="sr-only">Create group</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {groups.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      setNewName("")
                      setNewColor(GROUP_COLORS[0].value)
                      setCreateOpen(true)
                    }}
                    tooltip="Create your first group"
                    className="text-sidebar-foreground/50 hover:text-sidebar-foreground"
                  >
                    <FolderPlus className="size-4" />
                    <span>Create a group</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {groups.map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton
                    isActive={activeGroupId === group.id}
                    onClick={() => onSelectGroup(group.id)}
                    tooltip={group.name}
                  >
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <span>{group.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    {linkCountByGroup[group.id] || 0}
                  </SidebarMenuBadge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" className="w-36">
                      <DropdownMenuItem onClick={() => openEdit(group)}>
                        <Pencil className="size-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteGroupState(group)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />

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
      <AlertDialog open={!!deleteGroupState} onOpenChange={(open) => !open && setDeleteGroupState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the group{" "}
              <span className="font-medium text-foreground">
                {deleteGroupState?.name}
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
    </Sidebar>
  )
}
