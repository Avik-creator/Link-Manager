import { openDB, type IDBPDatabase } from "idb"

const DB_NAME = "linkdrop-cache"
const DB_VERSION = 1

export interface PreviewCacheEntry {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  hostname: string
  cachedAt: number
}

let _db: IDBPDatabase | null = null

/**
 * Returns a singleton handle to the LinkDrop IndexedDB cache database.
 * Contains object stores for preview metadata caching.
 */
export async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db

  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("preview-cache")) {
        db.createObjectStore("preview-cache", { keyPath: "url" })
      }
    },
  })

  return _db
}
