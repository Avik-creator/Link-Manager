import { useState, useEffect, useRef } from "react"
import type { LinkPreview } from "@/lib/types"
import { getCachedPreview, setCachedPreview } from "@/lib/db/preview-cache"
import { extractHostname } from "@/lib/url"

/**
 * Fetches and caches a link preview for the given URL.
 *
 * Behavior:
 *  - Checks the IndexedDB cache first (24h TTL)
 *  - Falls back to the /api/preview server route
 *  - Debounces fetch by 300ms to avoid spam on quick hover-overs
 *  - Aborts previous in-flight request when URL changes
 *  - Resets state cleanly when URL becomes null
 */
export function usePreview(url: string | null) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // Reset when URL is cleared
    if (!url) {
      setPreview(null)
      setIsLoading(false)
      setError(null)
      lastUrlRef.current = null
      return
    }

    // Skip if we already fetched this exact URL
    if (lastUrlRef.current === url && preview) return

    let cancelled = false

    async function fetchPreview() {
      // 1. Check IndexedDB cache
      const cached = await getCachedPreview(url!)
      if (cached && !cancelled) {
        setPreview(cached)
        setIsLoading(false)
        lastUrlRef.current = url
        return
      }

      setIsLoading(true)
      setError(null)

      // Abort any in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      try {
        const response = await fetch(
          `/api/preview?url=${encodeURIComponent(url!)}`,
          { signal: abortRef.current.signal }
        )

        if (cancelled) return

        if (response.ok) {
          const data = await response.json()
          const previewData: LinkPreview = {
            url: url!,
            title: data.title || "",
            description: data.description || "",
            image: data.image || "",
            favicon: data.favicon || "",
            hostname: data.hostname || extractHostname(url!),
            cachedAt: Date.now(),
          }

          setPreview(previewData)
          lastUrlRef.current = url

          // Write to cache in background (non-blocking)
          setCachedPreview(previewData)
        } else {
          setError("Failed to fetch preview")
        }
      } catch (err) {
        if (!cancelled && (err as Error).name !== "AbortError") {
          setError("Failed to fetch preview")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    // Debounce by 300ms
    const timeout = setTimeout(fetchPreview, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      abortRef.current?.abort()
    }
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps

  return { preview, isLoading, error }
}
