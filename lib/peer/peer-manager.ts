import Peer, { type DataConnection } from "peerjs"

export type PeerStatus = "initializing" | "ready" | "error" | "destroyed"

export interface PeerManagerCallbacks {
  onPeerReady: (peerId: string) => void
  onIncomingConnection: (conn: DataConnection, remotePeerId: string) => void
  onConnectionOpened: (conn: DataConnection, remotePeerId: string, isInitiator: boolean) => void
  onConnectionClosed: (remotePeerId: string) => void
  onError: (error: Error) => void
}

/**
 * Manages the PeerJS Peer instance and its DataConnections.
 *
 * Responsibilities:
 *  - Initialize PeerJS and acquire a peer ID from the signaling server
 *  - Accept incoming connections and expose them via callbacks
 *  - Initiate outgoing connections and track them
 *  - Handle reconnection when the signaling server disconnects
 *  - Provide cleanup via destroy()
 */
export class PeerManager {
  private peer: Peer | null = null
  private connections = new Map<string, DataConnection>()
  private callbacks: PeerManagerCallbacks
  private _peerId: string | null = null
  private _status: PeerStatus = "initializing"

  constructor(callbacks: PeerManagerCallbacks) {
    this.callbacks = callbacks
  }

  /** Initialize the PeerJS instance and register event handlers. */
  async init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.peer = new Peer({ debug: 0 })

        this.peer.on("open", (id) => {
          this._peerId = id
          this._status = "ready"
          this.callbacks.onPeerReady(id)
          resolve()
        })

        this.peer.on("connection", (conn) => {
          this.registerConnection(conn, false)
        })

        this.peer.on("error", (err) => {
          this._status = "error"
          this.callbacks.onError(err)
          // Only reject if we haven't resolved yet (during init)
          if (!this._peerId) reject(err)
        })

        this.peer.on("disconnected", () => {
          // Auto-reconnect to the signaling server
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect()
          }
        })
      } catch (error) {
        this._status = "error"
        reject(error)
      }
    })
  }

  /**
   * Connect to a remote peer by ID.
   * Returns the DataConnection if successful, null if we can't connect.
   */
  connect(remotePeerId: string): DataConnection | null {
    if (!this.peer || this.peer.destroyed) return null

    // Return existing connection if still open
    const existing = this.connections.get(remotePeerId)
    if (existing?.open) return existing

    const conn = this.peer.connect(remotePeerId, { reliable: true })
    this.registerConnection(conn, true)
    return conn
  }

  /** Close a specific peer connection. */
  disconnect(remotePeerId: string): void {
    const conn = this.connections.get(remotePeerId)
    if (conn) {
      conn.close()
      this.connections.delete(remotePeerId)
    }
  }

  /** Close all peer connections. */
  disconnectAll(): void {
    for (const [peerId, conn] of this.connections.entries()) {
      conn.close()
      this.connections.delete(peerId)
    }
  }

  /** Destroy the PeerJS instance and clean up all resources. */
  destroy(): void {
    this.disconnectAll()
    if (this.peer) {
      this.peer.destroy()
    }
    this._status = "destroyed"
  }

  // ─── Internal ───────────────────────────────────────────────────────────

  /**
   * Common setup for both incoming and outgoing connections.
   * `isInitiator` indicates whether we created this connection.
   */
  private registerConnection(conn: DataConnection, isInitiator: boolean): void {
    conn.on("open", () => {
      this.connections.set(conn.peer, conn)
      if (!isInitiator) {
        this.callbacks.onIncomingConnection(conn, conn.peer)
      }
      this.callbacks.onConnectionOpened(conn, conn.peer, isInitiator)
    })

    conn.on("close", () => {
      this.connections.delete(conn.peer)
      this.callbacks.onConnectionClosed(conn.peer)
    })

    conn.on("error", () => {
      this.connections.delete(conn.peer)
      this.callbacks.onConnectionClosed(conn.peer)
    })
  }

  // ─── Getters ────────────────────────────────────────────────────────────

  get peerId(): string | null {
    return this._peerId
  }

  get status(): PeerStatus {
    return this._status
  }

  get activeConnections(): Map<string, DataConnection> {
    return this.connections
  }
}
