"use client"

import { useState, useCallback, useMemo } from "react"
import { useLinks } from "@/hooks/use-links"
import { usePeerSync } from "@/hooks/use-peer-sync"
import { useImportExport } from "@/hooks/use-import-export"
import { LinkInput } from "@/components/link-input"
import { LinkList } from "@/components/link-list"
import { GroupSidebar } from "@/components/group-sidebar"
import { PeerPanel } from "@/components/peer-panel"
import { ImportExportModal } from "@/components/import-export-modal"
import { ConnectionBadge } from "@/components/connection-badge"
import { SyncStatus } from "@/components/sync-status"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Radio, ArrowDownUp, Menu, PanelLeft, PanelLeftClose } from "lucide-react"

export function LinkManager() {
  const {
    links,
    groups,
    addLink,
    updateLink,
    deleteLink,
    moveToGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    isLoaded,
    deviceId,
  } = useLinks()
  const { peerId, connections, syncState, connect, disconnect, forceSync } =
    usePeerSync()
  const { exportData, importData, importSummary, isImporting } =
    useImportExport()

  const [peerPanelOpen, setPeerPanelOpen] = useState(false)
  const [importExportOpen, setImportExportOpen] = useState(false)
  const [activeGroupId, setActiveGroupId] = useState<string | null>("all")

  const activePeers = connections.filter((c) => c.status === "connected")

  const handleAddLink = useCallback(
    (url: string, metadata?: Partial<{ groupId: string }>) => {
      return addLink(url, metadata)
    },
    [addLink]
  )

  const { linkCountByGroup, ungroupedCount } = useMemo(() => {
    const counts: Record<string, number> = {}
    let ungrouped = 0
    for (const link of links) {
      if (link.groupId) {
        counts[link.groupId] = (counts[link.groupId] || 0) + 1
      } else {
        ungrouped++
      }
    }
    return { linkCountByGroup: counts, ungroupedCount: ungrouped }
  }, [links])

  return (
    <SidebarProvider>
      <GroupSidebar
        groups={groups}
        linkCountByGroup={linkCountByGroup}
        totalLinks={links.length}
        ungroupedCount={ungroupedCount}
        activeGroupId={activeGroupId}
        onSelectGroup={setActiveGroupId}
        onAddGroup={addGroup}
        onUpdateGroup={updateGroup}
        onDeleteGroup={deleteGroup}
        isLoaded={isLoaded}
        linkCount={links.length}
      />

      <SidebarInset>
        <div className="flex h-dvh w-full max-w-full flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between gap-2 border-b border-border px-2 py-2 sm:px-4 sm:py-2.5">
            <div className="flex items-center gap-1.5">
              <SidebarToggleButton />
              <Separator orientation="vertical" className="hidden h-4 sm:inline sm:mr-1" />
              <div className="hidden sm:flex sm:items-center sm:gap-3">
                <ConnectionBadge />
                <Separator orientation="vertical" className="h-4" />
                <SyncStatus syncState={syncState} peerCount={activePeers.length} />
              </div>
              <div className="flex items-center gap-1.5 sm:hidden">
                <ConnectionBadge />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setImportExportOpen(true)}
                className="gap-1.5 text-xs h-8 px-2 sm:px-3"
              >
                <ArrowDownUp className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import/Export</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPeerPanelOpen(true)}
                className="gap-1.5 text-xs h-8 px-2 sm:px-3"
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

          {/* Link input + list */}
          <LinkInput
            groups={groups}
            activeGroupId={activeGroupId}
            onAddLink={handleAddLink}
            onAddGroup={addGroup}
          />
          <LinkList
            links={links}
            groups={groups}
            isLoaded={isLoaded}
            onDeleteLink={deleteLink}
            onMoveToGroup={moveToGroup}
            onUpdateLink={updateLink}
            filterGroupId={activeGroupId}
            deviceId={deviceId}
          />
        </div>
      </SidebarInset>

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

      <ImportExportModal
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        onExport={exportData}
        onImport={importData}
        isImporting={isImporting}
        importSummary={importSummary}
        linkCount={links.length}
      />

      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}

/** Custom sidebar toggle that shows Menu icon on mobile and PanelLeft on desktop */
function SidebarToggleButton() {
  const { toggleSidebar, isMobile, open } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-1 size-8"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      {isMobile ? (
        <Menu className="size-5" />
      ) : open ? (
        <PanelLeftClose className="size-5" />
      ) : (
        <PanelLeft className="size-5" />
      )}
    </Button>
  )
}
