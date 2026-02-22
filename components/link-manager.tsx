'use client'

import { useState, useCallback } from 'react'
import { useLinks } from '@/hooks/use-links'
import { usePeerSync } from '@/hooks/use-peer-sync'
import { useImportExport } from '@/hooks/use-import-export'
import { LinkInput } from '@/components/link-input'
import { LinkList } from '@/components/link-list'
import { PeerPanel } from '@/components/peer-panel'
import { ImportExportModal } from '@/components/import-export-modal'
import { ConnectionBadge } from '@/components/connection-badge'
import { SyncStatus } from '@/components/sync-status'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Radio, ArrowDownUp, Link as LinkIcon } from 'lucide-react'
import { Toaster } from 'sonner'

export function LinkManager() {
  const { links, addLink, deleteLink, isLoaded } = useLinks()
  const { peerId, connections, syncState, connect, disconnect, forceSync } = usePeerSync()
  const { exportData, importData, importSummary, isImporting } = useImportExport()

  const [peerPanelOpen, setPeerPanelOpen] = useState(false)
  const [importExportOpen, setImportExportOpen] = useState(false)

  const activePeers = connections.filter((c) => c.status === 'connected')

  const handleAddLink = useCallback(
    (url: string) => {
      return addLink(url)
    },
    [addLink]
  )

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
              {isLoaded ? `${links.length} link${links.length !== 1 ? 's' : ''}` : 'Loading...'}
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

      {/* Link Input */}
      <LinkInput onAddLink={handleAddLink} />

      {/* Link List */}
      <LinkList links={links} isLoaded={isLoaded} onDeleteLink={deleteLink} />

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

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-card text-card-foreground border-border',
        }}
      />
    </div>
  )
}
