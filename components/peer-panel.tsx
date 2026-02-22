'use client'

import { useState } from 'react'
import type { PeerConnection, SyncState } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Copy, Check, RefreshCw, X, Radio } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PeerPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  peerId: string | null
  connections: PeerConnection[]
  syncState: SyncState
  onConnect: (remotePeerId: string) => void
  onDisconnect: (remotePeerId: string) => void
  onForceSync: () => void
}

export function PeerPanel({
  open,
  onOpenChange,
  peerId,
  connections,
  syncState,
  onConnect,
  onDisconnect,
  onForceSync,
}: PeerPanelProps) {
  const [remotePeerId, setRemotePeerId] = useState('')
  const [copied, setCopied] = useState(false)

  const activePeers = connections.filter((c) => c.status === 'connected')

  const handleCopyId = () => {
    if (!peerId) return
    navigator.clipboard.writeText(peerId)
    setCopied(true)
    toast.success('Peer ID copied')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = () => {
    const id = remotePeerId.trim()
    if (!id) return
    if (id === peerId) {
      toast.error('Cannot connect to yourself')
      return
    }
    onConnect(id)
    setRemotePeerId('')
    toast.success('Connecting to peer...')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Peer Sync</SheetTitle>
          <SheetDescription>
            Connect with peers to sync your links in real-time over WebRTC.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-auto px-4">
          {/* Your Peer ID */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Peer ID
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-xs font-mono text-foreground truncate">
                {peerId || 'Initializing...'}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyId}
                disabled={!peerId}
                aria-label="Copy peer ID"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Connect to Peer */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Connect to Peer
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConnect()
                }}
                placeholder="Enter remote peer ID..."
                className="text-xs font-mono"
              />
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={!remotePeerId.trim()}
              >
                Connect
              </Button>
            </div>
          </div>

          <Separator />

          {/* Connected Peers */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Connections ({activePeers.length})
              </label>
              {activePeers.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onForceSync}
                  disabled={syncState === 'syncing'}
                  className="h-7 gap-1 text-xs"
                >
                  <RefreshCw
                    className={cn(
                      'h-3 w-3',
                      syncState === 'syncing' && 'animate-spin'
                    )}
                  />
                  Force Sync
                </Button>
              )}
            </div>

            {connections.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Radio className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No peers connected. Share your Peer ID or enter a remote ID to start syncing.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {connections.map((conn) => (
                  <div
                    key={conn.peerId}
                    className="flex items-center gap-2 rounded-md px-3 py-2 bg-muted/50"
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        conn.status === 'connected' && 'bg-emerald-500',
                        conn.status === 'connecting' && 'bg-amber-500 animate-pulse',
                        conn.status === 'disconnected' && 'bg-muted-foreground',
                        conn.status === 'error' && 'bg-destructive'
                      )}
                    />
                    <code className="flex-1 text-xs font-mono text-foreground truncate">
                      {conn.peerId}
                    </code>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">
                      {conn.status}
                    </span>
                    <button
                      onClick={() => onDisconnect(conn.peerId)}
                      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Disconnect from ${conn.peerId}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
