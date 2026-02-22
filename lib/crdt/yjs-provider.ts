import type { DataConnection } from "peerjs"
import * as Y from "yjs"
import type { SyncMessage, SyncMessageType } from "@/lib/types"

/**
 * Custom Yjs sync provider backed by PeerJS DataConnections.
 *
 * Implements the Yjs sync protocol:
 *  1. Initiator sends sync-step-1 (their state vector)
 *  2. Responder replies with sync-step-2 (the diff the initiator is missing)
 *  3. After initial sync, incremental updates are broadcast in real-time
 *
 * The key fix here is that we track which peers have already been synced
 * to avoid the infinite sync-step-1 echo loop in the previous version.
 */
export class PeerJSYjsProvider {
  private doc: Y.Doc
  private connections = new Map<string, DataConnection>()
  private synced = new Set<string>()
  private updateHandler: (update: Uint8Array, origin: unknown) => void

  constructor(doc: Y.Doc) {
    this.doc = doc

    // Broadcast local mutations to all connected peers
    this.updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === this) return // don't echo peer-originated updates
      this.broadcastUpdate(update)
    }

    this.doc.on("update", this.updateHandler)
  }

  /**
   * Register a newly opened DataConnection and kick off the sync handshake.
   * The initiator (whoever called peer.connect()) sends sync-step-1 first.
   */
  addConnection(peerId: string, conn: DataConnection, isInitiator: boolean): void {
    this.connections.set(peerId, conn)
    this.synced.delete(peerId)

    conn.on("data", (rawData: unknown) => {
      this.handleMessage(rawData as SyncMessage, peerId)
    })

    conn.on("close", () => {
      this.connections.delete(peerId)
      this.synced.delete(peerId)
    })

    conn.on("error", () => {
      this.connections.delete(peerId)
      this.synced.delete(peerId)
    })

    // Only the initiator sends step-1 to avoid duplicate handshakes
    if (isInitiator) {
      this.sendSyncStep1(conn)
    }
  }

  /** Remove a peer connection and clean up tracking state. */
  removeConnection(peerId: string): void {
    this.connections.delete(peerId)
    this.synced.delete(peerId)
  }

  // ─── Message handling ───────────────────────────────────────────────────

  private handleMessage(message: SyncMessage, fromPeerId: string): void {
    const conn = this.connections.get(fromPeerId)
    if (!conn) return

    switch (message.type) {
      case "sync-step-1": {
        // Peer sent their state vector. Compute the diff they need and send it back.
        const remoteStateVector = new Uint8Array(message.data)
        const missingUpdate = Y.encodeStateAsUpdate(this.doc, remoteStateVector)

        this.sendMessage(conn, {
          type: "sync-step-2",
          data: Array.from(missingUpdate),
        })

        // If we haven't synced with this peer yet, send our own step-1
        // so they can compute our diff too (completing bidirectional sync).
        if (!this.synced.has(fromPeerId)) {
          this.sendSyncStep1(conn)
          this.synced.add(fromPeerId)
        }
        break
      }

      case "sync-step-2": {
        // Peer sent the diff we were missing. Apply it.
        const update = new Uint8Array(message.data)
        Y.applyUpdate(this.doc, update, this)
        this.synced.add(fromPeerId)
        break
      }

      case "update": {
        // Real-time incremental update from a peer.
        const update = new Uint8Array(message.data)
        Y.applyUpdate(this.doc, update, this)
        break
      }
    }
  }

  // ─── Outbound messages ──────────────────────────────────────────────────

  private sendSyncStep1(conn: DataConnection): void {
    this.sendMessage(conn, {
      type: "sync-step-1",
      data: Array.from(Y.encodeStateVector(this.doc)),
    })
  }

  private broadcastUpdate(update: Uint8Array): void {
    const message: SyncMessage = {
      type: "update",
      data: Array.from(update),
    }
    for (const conn of this.connections.values()) {
      if (conn.open) {
        this.sendMessage(conn, message)
      }
    }
  }

  /**
   * Force a full re-sync with all connected peers by re-exchanging
   * state vectors. Useful after reconnect or manual trigger.
   */
  forceSync(): void {
    this.synced.clear()
    for (const [, conn] of this.connections) {
      if (conn.open) {
        this.sendSyncStep1(conn)
      }
    }
  }

  private sendMessage(conn: DataConnection, message: SyncMessage): void {
    try {
      if (conn.open) {
        conn.send(message)
      }
    } catch {
      // Connection may have closed between the check and the send
    }
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  destroy(): void {
    this.doc.off("update", this.updateHandler)
    this.connections.clear()
    this.synced.clear()
  }

  get connectedPeers(): string[] {
    return Array.from(this.connections.keys())
  }
}
