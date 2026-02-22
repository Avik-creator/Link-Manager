"use client"

import { useState, useCallback } from "react"
import { useLinks } from "@/hooks/use-links"
import { usePeerSync } from "@/hooks/use-peer-sync"
import { useImportExport } from "@/hooks/use-import-export"
import { LinkInput } from "@/components/link-input"
import { LinkList } from "@/components/link-list"
import { PeerPanel } from "@/components/peer-panel"
import { ImportExportModal } from "@/components/import-export-modal"
import { GroupManager } from "@/components/group-manager"
import { ConnectionBadge } from "@/components/connection-badge"
import { SyncStatus } from "@/components/sync-status"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Radio,
  ArrowDownUp,
  Link as LinkIcon,
  FolderOpen,
  Layers,
  Inbox,
} from "lucide-react"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"

export function LinkManager() {
  const {
    links,
    groups,
    addLink,
    deleteLink,
    moveToGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    isLoaded,
  } = useLinks()
  const { peerId, connections, syncState, connect, disconnect, forceSync } =
    usePeerSync()
  const { exportData, importData, importSummary, isImporting } =
    useImportExport()

  const [peerPanelOpen, setPeerPanelOpen] = useState(false)
  const [importExportOpen, setImportExportOpen] = useState(false)
  const [groupManagerOpen, setGroupManagerOpen] = useState(false)
  const [filterGroupId, setFilterGroupId] = useState<string | null>("all")

  const activePeers = connections.filter((c) => c.status === "connected")

  const handleAddLink = useCallback(
    (url: string, metadata?: Parameters<typeof addLink>[1]) => {
      return addLink(url, metadata)
    },
    [addLink]
  )

  const ungroupedCount = links.filter((l) => !l.groupId).length

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LinkIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">
              LinkDrop
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoaded
                ? `${links.length} link${links.length !== 1 ? "s" : ""}`
                : "Loading..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionBadge />
          <Separator orientation="vertical" className="h-4" />
          <SyncStatus syncState={syncState} peerCount={activePeers.length} />
          <Separator orientation="vertical" className="h-4" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setGroupManagerOpen(true)}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Groups</span>
            {groups.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                {groups.length}
              </Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setImportExportOpen(true)}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import/Export</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPeerPanelOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Radio className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Peers</span>
            {activePeers.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {activePeers.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Group Filter Bar */}
      {groups.length > 0 && (
        <div className="border-b border-border">
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 px-5 py-2">
              <FilterChip
                active={filterGroupId === "all"}
                onClick={() => setFilterGroupId("all")}
                icon={<Layers className="h-3 w-3" />}
                label="All"
                count={links.length}
              />
              {groups.map((group) => {
                const count = links.filter(
                  (l) => l.groupId === group.id
                ).length
                return (
                  <FilterChip
                    key={group.id}
                    active={filterGroupId === group.id}
                    onClick={() => setFilterGroupId(group.id)}
                    color={group.color}
                    label={group.name}
                    count={count}
                  />
                )
              })}
              <FilterChip
                active={filterGroupId === "ungrouped"}
                onClick={() => setFilterGroupId("ungrouped")}
                icon={<Inbox className="h-3 w-3" />}
                label="Ungrouped"
                count={ungroupedCount}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Link Input */}
      <LinkInput
        groups={groups}
        activeGroupId={filterGroupId}
        onAddLink={handleAddLink}
      />

      {/* Link List */}
      <LinkList
        links={links}
        groups={groups}
        isLoaded={isLoaded}
        onDeleteLink={deleteLink}
        onMoveToGroup={moveToGroup}
        filterGroupId={filterGroupId}
      />

      {/* Peer Panel */}
      <PeerPanel
        open={peerPanelOpen}
        onOpenChange={setPeerPanelOpen}
        peerId={peerId}
        connections={connections}
        syncState={syncState}
        onConnect={connect}
        onDisconnect={disconnect}
        onForceSync={forceSync}
      />

      {/* Import/Export Modal */}
      <ImportExportModal
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        onExport={exportData}
        onImport={importData}
        isImporting={isImporting}
        importSummary={importSummary}
        linkCount={links.length}
      />

      {/* Group Manager Modal */}
      <GroupManager
        open={groupManagerOpen}
        onOpenChange={setGroupManagerOpen}
        groups={groups}
        onAddGroup={addGroup}
        onUpdateGroup={updateGroup}
        onDeleteGroup={deleteGroup}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "bg-card text-card-foreground border-border",
        }}
      />
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  color,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  color?: string
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: active ? "currentColor" : color }}
        />
      )}
      {icon}
      {label}
      <span
        className={cn(
          "text-[10px]",
          active
            ? "text-primary-foreground/70"
            : "text-muted-foreground/60"
        )}
      >
        {count}
      </span>
    </button>
  )
}
