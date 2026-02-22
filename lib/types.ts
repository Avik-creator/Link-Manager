// ─── Link entity (stored in CRDT Y.Map as JSON) ────────────────────────────
export interface Link {
  id: string
  url: string
  canonicalUrl: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  tags: string[]
  createdAt: number
  updatedAt: number
  deleted: boolean
}

// ─── OG metadata preview (cached in IndexedDB) ─────────────────────────────
export interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  hostname: string
  cachedAt: number
}

// ─── Peer connection state ──────────────────────────────────────────────────
export interface PeerConnection {
  peerId: string
  status: "connecting" | "connected" | "disconnected" | "error"
  connectedAt?: number | null
}

// ─── Sync state machine ────────────────────────────────────────────────────
export type SyncState = "idle" | "syncing" | "synced" | "error"

// ─── Import summary ────────────────────────────────────────────────────────
export interface ImportSummary {
  totalBefore: number
  totalAfter: number
  newLinks: number
}

// ─── PeerJS sync protocol message types ────────────────────────────────────
export type SyncMessageType = "sync-step-1" | "sync-step-2" | "update"

export interface SyncMessage {
  type: SyncMessageType
  /** Uint8Array serialized as number[] for DataConnection JSON transport */
  data: number[]
}
