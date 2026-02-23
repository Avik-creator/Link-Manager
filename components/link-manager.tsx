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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { Radio, ArrowDownUp, Link as LinkIcon, FolderOpen } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

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
  } = useLinks()
  const { peerId, connections, syncState, connect, disconnect, forceSync } =
    usePeerSync()
  const { exportData, importData, importSummary, isImporting } =
    useImportExport()

  const [peerPanelOpen, setPeerPanelOpen] = useState(false)
  const [importExportOpen, setImportExportOpen] = useState(false)
  const [activeGroupId, setActiveGroupId] = useState<string | null>("all")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isMobile = useIsMobile()
  const activePeers = connections.filter((c) => c.status === "connected")

  const handleAddLink = useCallback(
    (url: string, metadata?: Partial<{ groupId: string }>) => {
      return addLink(url, metadata)
    },
    [addLink]
  )

  const handleSelectGroup = useCallback(
    (groupId: string | null) => {
      setActiveGroupId(groupId)
      if (isMobile) setMobileSidebarOpen(false)
    },
    [isMobile]
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

  const sidebarContent = (
    <GroupSidebar
      groups={groups}
      linkCountByGroup={linkCountByGroup}
      totalLinks={links.length}
      ungroupedCount={ungroupedCount}
      activeGroupId={activeGroupId}
      onSelectGroup={handleSelectGroup}
      onAddGroup={addGroup}
      onUpdateGroup={updateGroup}
      onDeleteGroup={deleteGroup}
    />
  )

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile sidebar toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open groups"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LinkIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none text-foreground">
              LinkDrop
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isLoaded
                ? `${links.length} link${links.length !== 1 ? "s" : ""}`
                : "Loading..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            <ConnectionBadge />
            <Separator orientation="vertical" className="h-4" />
            <SyncStatus syncState={syncState} peerCount={activePeers.length} />
            <Separator orientation="vertical" className="h-4" />
          </div>
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

      {/* Mobile status bar - visible only on small screens */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 sm:hidden">
        <ConnectionBadge />
        <SyncStatus syncState={syncState} peerCount={activePeers.length} />
      </div>

      {/* Main area with sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          {sidebarContent}
        </div>

        {/* Mobile sidebar as Sheet */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Groups</SheetTitle>
              <SheetDescription>Filter links by group</SheetDescription>
            </SheetHeader>
            {sidebarContent}
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 flex-col overflow-hidden">
          <LinkInput
            groups={groups}
            activeGroupId={activeGroupId}
            onAddLink={handleAddLink}
          />
          <LinkList
            links={links}
            groups={groups}
            isLoaded={isLoaded}
            onDeleteLink={deleteLink}
            onMoveToGroup={moveToGroup}
            onUpdateLink={updateLink}
            filterGroupId={activeGroupId}
          />
        </div>
      </div>

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
    </div>
  )
}
