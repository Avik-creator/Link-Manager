// ─── Link entity (stored in CRDT Y.Map as JSON) ────────────────────────────
export interface Link {
  id: string
  url: string
  canonicalUrl: string
  title?: string
  description?: string
  /** User-written note describing what the link is for */
  userDescription?: string
  image?: string
  favicon?: string
  tags: string[]
  groupId?: string
  createdAt: number
  updatedAt: number
  deleted: boolean
}

// ─── Group entity (stored in CRDT Y.Map as JSON) ───────────────────────────
export interface Group {
  id: string
  name: string
  color: string
  createdAt: number
  updatedAt: number
  deleted: boolean
}

export const GROUP_COLORS = [
  { name: "Red", value: "oklch(0.637 0.237 25.331)" },
  { name: "Orange", value: "oklch(0.705 0.213 47.604)" },
  { name: "Amber", value: "oklch(0.795 0.184 86.047)" },
  { name: "Green", value: "oklch(0.723 0.219 149.579)" },
  { name: "Teal", value: "oklch(0.704 0.14 182.503)" },
  { name: "Blue", value: "oklch(0.623 0.214 259.815)" },
  { name: "Indigo", value: "oklch(0.585 0.233 277.117)" },
  { name: "Purple", value: "oklch(0.627 0.265 303.9)" },
  { name: "Pink", value: "oklch(0.656 0.241 354.308)" },
] as const

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
