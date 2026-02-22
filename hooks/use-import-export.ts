import { useState, useCallback } from "react"
import type { ImportSummary } from "@/lib/types"
import { exportState, importState, getLinks } from "@/lib/crdt/yjs-doc"

/**
 * Handles exporting the full Yjs CRDT state as a JSON file and importing
 * external state that merges automatically via CRDT conflict resolution.
 *
 * Export format:
 *  - version: 1
 *  - state: base64-encoded Yjs update
 *  - linkCount: number of active links at time of export
 *  - exportedAt: ISO timestamp
 */
export function useImportExport() {
  const [isImporting, setIsImporting] = useState(false)
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)

  const exportData = useCallback(() => {
    const state = exportState()
    // Convert Uint8Array to base64 for JSON-safe transport
    const base64 = btoa(
      Array.from(state)
        .map((byte) => String.fromCharCode(byte))
        .join("")
    )

    const exportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      state: base64,
      linkCount: getLinks().length,
    }

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `linkdrop-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback(
    async (file: File): Promise<ImportSummary | null> => {
      setIsImporting(true)
      setImportSummary(null)

      try {
        const text = await file.text()
        const payload = JSON.parse(text)

        if (!payload.state || payload.version !== 1) {
          throw new Error("Invalid export format")
        }

        const totalBefore = getLinks().length

        // Decode base64 back to Uint8Array
        const binary = atob(payload.state)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }

        // Apply as Yjs update -- CRDT handles merge + conflict resolution
        importState(bytes)

        const totalAfter = getLinks().length
        const summary: ImportSummary = {
          totalBefore,
          totalAfter,
          newLinks: Math.max(0, totalAfter - totalBefore),
        }

        setImportSummary(summary)
        return summary
      } catch {
        setImportSummary(null)
        return null
      } finally {
        setIsImporting(false)
      }
    },
    []
  )

  return { exportData, importData, importSummary, isImporting }
}
