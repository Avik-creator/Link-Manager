/**
 * URL canonicalization, validation, and extraction utilities.
 * Used for deduplication and display across the app.
 */

/**
 * Canonicalizes a URL for deduplication: lowercase hostname,
 * remove default ports, remove trailing slash, sort query params, strip hash.
 */
export function canonicalizeUrl(raw: string): string {
  try {
    let input = raw.trim()
    if (!/^https?:\/\//i.test(input)) {
      input = `https://${input}`
    }

    const url = new URL(input)
    url.protocol = url.protocol.toLowerCase()
    url.hostname = url.hostname.toLowerCase()

    // Remove default ports
    if (
      (url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")
    ) {
      url.port = ""
    }

    // Remove trailing slash from pathname (keep root /)
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1)
    }

    // Sort search params for canonical order
    const params = new URLSearchParams(url.searchParams)
    const sorted = new URLSearchParams([...params.entries()].sort())
    url.search = sorted.toString() ? `?${sorted.toString()}` : ""

    // Strip fragment
    url.hash = ""

    return url.toString()
  } catch {
    return raw.trim().toLowerCase()
  }
}

/**
 * Validates that a string can be parsed as an http(s) URL.
 */
export function isValidUrl(input: string): boolean {
  try {
    let url = input.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Extracts the display hostname from a URL, stripping "www." prefix.
 */
export function extractHostname(url: string): string {
  try {
    let input = url.trim()
    if (!/^https?:\/\//i.test(input)) {
      input = `https://${input}`
    }
    return new URL(input).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/**
 * Ensures a URL has an http(s) protocol prefix.
 */
export function ensureProtocol(url: string): string {
  const trimmed = url.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

/**
 * Formats a relative time string from a timestamp.
 */
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
