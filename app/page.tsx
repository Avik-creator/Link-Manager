"use client"

import dynamic from "next/dynamic"

// Dynamic import with SSR disabled -- must be in a Client Component in Next.js 16+.
// Yjs, PeerJS, and IndexedDB require browser APIs not available on the server.
const LinkManager = dynamic(
  () =>
    import("@/components/link-manager").then((mod) => ({
      default: mod.LinkManager,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading LinkDrop...</p>
        </div>
      </div>
    ),
  }
)

export default function Page() {
  return <LinkManager />
}
