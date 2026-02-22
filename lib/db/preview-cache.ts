import { getDB, type PreviewCacheEntry } from "./index"
import type { LinkPreview } from "@/lib/types"

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Retrieves a cached preview if it exists and is still fresh.
 * Returns null on cache miss, TTL expiry, or any read error.
 */
export async function getCachedPreview(
  url: string
): Promise<LinkPreview | null> {
  try {
    const db = await getDB()
    const entry = (await db.get("preview-cache", url)) as
      | PreviewCacheEntry
      | undefined

    if (!entry) return null

    // Evict stale entries
    if (Date.now() - entry.cachedAt > CACHE_TTL) {
      await db.delete("preview-cache", url)
      return null
    }

    return {
      url: entry.url,
      title: entry.title || "",
      description: entry.description || "",
      image: entry.image || "",
      favicon: entry.favicon || "",
      hostname: entry.hostname,
      cachedAt: entry.cachedAt,
    }
  } catch {
    return null
  }
}

/**
 * Writes a preview to the cache with the current timestamp.
 */
export async function setCachedPreview(preview: LinkPreview): Promise<void> {
  try {
    const db = await getDB()
    const entry: PreviewCacheEntry = {
      url: preview.url,
      title: preview.title,
      description: preview.description,
      image: preview.image,
      favicon: preview.favicon,
      hostname: preview.hostname,
      cachedAt: Date.now(),
    }
    await db.put("preview-cache", entry)
  } catch {
    // Silently fail cache writes -- non-critical path
  }
}

/**
 * Removes all cache entries older than 24 hours.
 * Intended to be called on startup or at idle intervals.
 */
export async function clearExpiredPreviews(): Promise<void> {
  try {
    const db = await getDB()
    const tx = db.transaction("preview-cache", "readwrite")
    const store = tx.objectStore("preview-cache")
    let cursor = await store.openCursor()
    const now = Date.now()

    while (cursor) {
      const entry = cursor.value as PreviewCacheEntry
      if (now - entry.cachedAt > CACHE_TTL) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }

    await tx.done
  } catch {
    // Silently fail cleanup
  }
}
