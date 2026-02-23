import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"
import { nanoid } from "nanoid"
import type { Link, Group } from "@/lib/types"
import { canonicalizeUrl, ensureProtocol } from "@/lib/url"

const DOC_NAME = "linkdrop-crdt-v1"

// ─── Singleton instances ────────────────────────────────────────────────────

let _doc: Y.Doc | null = null
let _persistence: IndexeddbPersistence | null = null
let _syncedPromise: Promise<void> | null = null

/** Returns the shared Yjs document singleton. */
export function getDoc(): Y.Doc {
  if (!_doc) {
    _doc = new Y.Doc()
  }
  return _doc
}

/** Returns the Y.Map that stores links as JSON strings keyed by link ID. */
export function getLinksMap(): Y.Map<string> {
  return getDoc().getMap<string>("links")
}

/** Returns the Y.Map that stores groups as JSON strings keyed by group ID. */
export function getGroupsMap(): Y.Map<string> {
  return getDoc().getMap<string>("groups")
}

/**
 * Initializes IndexedDB persistence for the Yjs document.
 * Returns a promise that resolves once the persisted state is loaded.
 * Safe to call multiple times (idempotent).
 */
export function initPersistence(): Promise<void> {
  if (_syncedPromise) return _syncedPromise

  const doc = getDoc()
  _persistence = new IndexeddbPersistence(DOC_NAME, doc)

  _syncedPromise = new Promise<void>((resolve) => {
    _persistence!.once("synced", () => {
      resolve()
    })
  })

  return _syncedPromise
}

// ─── Link CRUD operations (all mutations go through Yjs) ────────────────────

/**
 * Adds a new link to the CRDT document.
 * Canonicalizes the URL and checks for duplicates.
 * Returns the created Link or null if it's a duplicate.
 */
export function addLink(url: string, metadata?: Partial<Link>): Link | null {
  const canonical = canonicalizeUrl(url)
  const linksMap = getLinksMap()

  // Deduplicate by canonical URL
  for (const [, value] of linksMap.entries()) {
    try {
      const existing: Link = JSON.parse(value)
      if (existing.canonicalUrl === canonical && !existing.deleted) {
        return null
      }
    } catch {
      // Skip malformed entries
    }
  }

  const now = Date.now()
  const link: Link = {
    id: nanoid(),
    url: ensureProtocol(url),
    canonicalUrl: canonical,
    title: metadata?.title ?? "",
    description: metadata?.description ?? "",
    userDescription: metadata?.userDescription ?? "",
    image: metadata?.image ?? "",
    favicon: metadata?.favicon ?? "",
    tags: metadata?.tags ?? [],
    groupId: metadata?.groupId,
    createdAt: now,
    updatedAt: now,
    deleted: false,
  }

  linksMap.set(link.id, JSON.stringify(link))
  return link
}

/**
 * Partially updates a link by ID.
 * Merges the provided fields into the existing link and bumps updatedAt.
 */
export function updateLink(id: string, partial: Partial<Link>): void {
  const linksMap = getLinksMap()
  const raw = linksMap.get(id)
  if (!raw) return

  try {
    const existing: Link = JSON.parse(raw)
    const updated: Link = {
      ...existing,
      ...partial,
      id: existing.id, // prevent ID mutation
      updatedAt: Date.now(),
    }
    linksMap.set(id, JSON.stringify(updated))
  } catch {
    // Skip malformed entries
  }
}

/** Soft-deletes a link by setting its deleted flag. */
export function deleteLink(id: string): void {
  updateLink(id, { deleted: true })
}

/** Returns all non-deleted links, sorted newest-first. */
export function getLinks(): Link[] {
  const linksMap = getLinksMap()
  const links: Link[] = []

  for (const [, value] of linksMap.entries()) {
    try {
      const link: Link = JSON.parse(value)
      if (!link.deleted) {
        links.push(link)
      }
    } catch {
      // Skip malformed entries
    }
  }

  return links.sort((a, b) => b.createdAt - a.createdAt)
}

/** Subscribes to all changes on the links map. Returns an unsubscribe function. */
export function observeLinks(callback: () => void): () => void {
  const linksMap = getLinksMap()
  linksMap.observe(callback)
  return () => linksMap.unobserve(callback)
}

// ─── Group CRUD operations ──────────────────────────────────────────────────

/** Creates a new group. Returns the created Group. */
export function addGroup(name: string, color: string): Group {
  const now = Date.now()
  const group: Group = {
    id: nanoid(),
    name: name.trim(),
    color,
    createdAt: now,
    updatedAt: now,
    deleted: false,
  }
  getGroupsMap().set(group.id, JSON.stringify(group))
  return group
}

/** Updates a group by ID. */
export function updateGroup(id: string, partial: Partial<Group>): void {
  const groupsMap = getGroupsMap()
  const raw = groupsMap.get(id)
  if (!raw) return
  try {
    const existing: Group = JSON.parse(raw)
    const updated: Group = {
      ...existing,
      ...partial,
      id: existing.id,
      updatedAt: Date.now(),
    }
    groupsMap.set(id, JSON.stringify(updated))
  } catch {
    // Skip malformed entries
  }
}

/** Soft-deletes a group and ungroups all its links. */
export function deleteGroup(id: string): void {
  updateGroup(id, { deleted: true })
  // Remove groupId from all links in this group
  const linksMap = getLinksMap()
  for (const [linkId, value] of linksMap.entries()) {
    try {
      const link: Link = JSON.parse(value)
      if (link.groupId === id && !link.deleted) {
        const updated = { ...link, groupId: undefined, updatedAt: Date.now() }
        linksMap.set(linkId, JSON.stringify(updated))
      }
    } catch {
      // skip
    }
  }
}

/** Returns all non-deleted groups, sorted by creation date. */
export function getGroups(): Group[] {
  const groupsMap = getGroupsMap()
  const groups: Group[] = []
  for (const [, value] of groupsMap.entries()) {
    try {
      const group: Group = JSON.parse(value)
      if (!group.deleted) groups.push(group)
    } catch {
      // skip
    }
  }
  return groups.sort((a, b) => a.createdAt - b.createdAt)
}

/** Subscribes to all changes on the groups map. Returns an unsubscribe function. */
export function observeGroups(callback: () => void): () => void {
  const groupsMap = getGroupsMap()
  groupsMap.observe(callback)
  return () => groupsMap.unobserve(callback)
}

// ─── State exchange helpers (used by sync provider) ─────────────────────────

export function exportState(): Uint8Array {
  return Y.encodeStateAsUpdate(getDoc())
}

export function importState(update: Uint8Array): void {
  Y.applyUpdate(getDoc(), update)
}

export function getStateVector(): Uint8Array {
  return Y.encodeStateVector(getDoc())
}

export function encodeStateAsUpdate(stateVector: Uint8Array): Uint8Array {
  return Y.encodeStateAsUpdate(getDoc(), stateVector)
}

export function applyUpdate(update: Uint8Array): void {
  Y.applyUpdate(getDoc(), update)
}
