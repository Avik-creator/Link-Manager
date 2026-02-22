import { useState, useCallback, useRef, useEffect } from "react"
import type { PeerConnection, SyncState } from "@/lib/types"
import { PeerManager } from "@/lib/peer/peer-manager"
import { PeerJSYjsProvider } from "@/lib/crdt/yjs-provider"
import { getDoc } from "@/lib/crdt/yjs-doc"

/**
 * Manages the full PeerJS + Yjs sync lifecycle.
 *
 * On mount:
 *  - Creates a PeerManager to get a peer ID from the signaling server
 *  - Creates a PeerJSYjsProvider to handle Yjs sync over DataConnections
 *
 * Provides:
 *  - peerId: our local peer ID (null while initializing)
 *  - connections: array of peer connection states
 *  - syncState: current sync status
 *  - connect / disconnect / forceSync actions
 */
export function usePeerSync() {
  const [peerId, setPeerId] = useState<string | null>(null)
  const [connections, setConnections] = useState<PeerConnection[]>([])
  const [syncState, setSyncState] = useState<SyncState>("idle")
  const [error, setError] = useState<string | null>(null)

  const peerManagerRef = useRef<PeerManager | null>(null)
  const yjsProviderRef = useRef<PeerJSYjsProvider | null>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const doc = getDoc()
    const provider = new PeerJSYjsProvider(doc)
    yjsProviderRef.current = provider

    const manager = new PeerManager({
      onPeerReady: (id) => {
        setPeerId(id)
        setSyncState("idle")
      },

      onIncomingConnection: (conn, remotePeerId) => {
        // Register with provider as responder (not initiator)
        provider.addConnection(remotePeerId, conn, false)
        setSyncState("syncing")
        setTimeout(() => setSyncState("synced"), 1500)
      },

      onConnectionOpened: (_conn, remotePeerId, isInitiator) => {
        setConnections((prev) => {
          const existing = prev.find((p) => p.peerId === remotePeerId)
          if (existing) {
            return prev.map((p) =>
              p.peerId === remotePeerId
                ? { ...p, status: "connected" as const, connectedAt: Date.now() }
                : p
            )
          }
          return [
            ...prev,
            {
              peerId: remotePeerId,
              status: "connected" as const,
              connectedAt: Date.now(),
            },
          ]
        })

        // If we initiated the connection, register with the Yjs provider as initiator
        if (isInitiator) {
          provider.addConnection(remotePeerId, _conn, true)
          setSyncState("syncing")
          setTimeout(() => setSyncState("synced"), 1500)
        }
      },

      onConnectionClosed: (remotePeerId) => {
        provider.removeConnection(remotePeerId)
        setConnections((prev) =>
          prev.map((p) =>
            p.peerId === remotePeerId
              ? { ...p, status: "disconnected" as const }
              : p
          )
        )
      },

      onError: (err) => {
        setError(err.message)
        setSyncState("error")
      },
    })

    peerManagerRef.current = manager

    manager.init().catch((err) => {
      setError(err.message)
      setSyncState("error")
    })

    return () => {
      provider.destroy()
      manager.destroy()
    }
  }, [])

  const connect = useCallback((remotePeerId: string) => {
    if (!peerManagerRef.current) return

    // Add as "connecting" immediately for optimistic UI
    setConnections((prev) => {
      const existing = prev.find((p) => p.peerId === remotePeerId)
      if (existing) {
        return prev.map((p) =>
          p.peerId === remotePeerId
            ? { ...p, status: "connecting" as const }
            : p
        )
      }
      return [
        ...prev,
        { peerId: remotePeerId, status: "connecting" as const, connectedAt: null },
      ]
    })

    setSyncState("syncing")
    peerManagerRef.current.connect(remotePeerId)
  }, [])

  const disconnect = useCallback((remotePeerId: string) => {
    peerManagerRef.current?.disconnect(remotePeerId)
    yjsProviderRef.current?.removeConnection(remotePeerId)
    setConnections((prev) => prev.filter((p) => p.peerId !== remotePeerId))
  }, [])

  const forceSync = useCallback(() => {
    yjsProviderRef.current?.forceSync()
    setSyncState("syncing")
    setTimeout(() => setSyncState("synced"), 1500)
  }, [])

  return {
    peerId,
    connections,
    syncState,
    error,
    connect,
    disconnect,
    forceSync,
  }
}
