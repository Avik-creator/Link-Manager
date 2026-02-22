import { NextResponse } from "next/server"
import { isValidUrl, extractHostname } from "@/lib/url"

// ─── SSRF protection: block private/reserved IP ranges ─────────────────────

const BLOCKED_HOST_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^fd/,
  /^localhost$/i,
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,
]

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(hostname))
}

// ─── Sanitization helpers ───────────────────────────────────────────────────

function sanitizeText(
  text: string | undefined | null,
  maxLength = 500
): string {
  if (!text) return ""
  // Strip HTML tags, collapse whitespace
  const clean = text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (!clean) return ""
  return clean.slice(0, maxLength)
}

// ─── OG tag extraction (regex-based, no DOM parser needed) ──────────────────

function extractMeta(html: string, property: string): string | undefined {
  // property="..." content="..."
  const ogRegex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i"
  )
  let match = ogRegex.exec(html)
  if (match?.[1]) return match[1]

  // content="..." property="..." (reversed attribute order)
  const reversed = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    "i"
  )
  match = reversed.exec(html)
  if (match?.[1]) return match[1]

  return undefined
}

function extractTitle(html: string): string | undefined {
  const match = /<title[^>]*>([^<]*)<\/title>/i.exec(html)
  return match?.[1]?.trim() || undefined
}

function extractFavicon(html: string, baseUrl: string): string {
  const iconRegex =
    /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']*)["']/i
  const match = iconRegex.exec(html)
  if (match?.[1]) {
    try {
      return new URL(match[1], baseUrl).href
    } catch {
      return match[1]
    }
  }

  // Reversed attribute order
  const reversed =
    /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i
  const matchReversed = reversed.exec(html)
  if (matchReversed?.[1]) {
    try {
      return new URL(matchReversed[1], baseUrl).href
    } catch {
      return matchReversed[1]
    }
  }

  // Fall back to /favicon.ico
  try {
    return new URL("/favicon.ico", baseUrl).href
  } catch {
    return ""
  }
}

// ─── Route handler ──────────────────────────────────────────────────────────

const emptyPreview = (url: string) => ({
  hostname: extractHostname(url),
  title: "",
  description: "",
  image: "",
  favicon: "",
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    const parsedUrl = new URL(url)

    // SSRF protection
    if (isBlockedHost(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Blocked host" }, { status: 403 })
    }

    // Fetch with 5s timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "LinkDrop-Preview-Bot/1.0 (compatible)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(emptyPreview(url), { status: 200 })
    }

    // Only parse HTML content
    const contentType = response.headers.get("content-type") || ""
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      return NextResponse.json(
        { ...emptyPreview(url), title: extractHostname(url) },
        { status: 200 }
      )
    }

    // Stream body with 1MB size limit, stop at </head>
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json(emptyPreview(url), { status: 200 })
    }

    let html = ""
    const decoder = new TextDecoder()
    const MAX_SIZE = 1024 * 1024

    while (html.length < MAX_SIZE) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
      if (html.includes("</head>")) break
    }
    reader.cancel()

    // Extract and sanitize metadata
    const title = sanitizeText(
      extractMeta(html, "og:title") || extractTitle(html)
    )
    const description = sanitizeText(
      extractMeta(html, "og:description") || extractMeta(html, "description"),
      300
    )
    const rawImage = extractMeta(html, "og:image")
    const favicon = extractFavicon(html, url)
    const hostname = extractHostname(url)

    // Resolve relative image URLs
    let image = ""
    if (rawImage) {
      try {
        image = new URL(rawImage, url).href
      } catch {
        image = rawImage
      }
    }

    return NextResponse.json({
      title,
      description,
      image,
      favicon,
      hostname,
    })
  } catch {
    return NextResponse.json(emptyPreview(url), { status: 200 })
  }
}
