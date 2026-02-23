"use client"

import { useRef } from "react"
import type { ImportSummary } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Upload, FileJson, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ImportExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: () => void
  onImport: (file: File) => Promise<ImportSummary | null>
  isImporting: boolean
  importSummary: ImportSummary | null
  linkCount: number
}

export function ImportExportModal({
  open,
  onOpenChange,
  onExport,
  onImport,
  isImporting,
  importSummary,
  linkCount,
}: ImportExportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    onExport()
    toast.success("Export complete", {
      description: `Exported ${linkCount} links.`,
    })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = await onImport(file)
    if (result) {
      toast.success("Import complete", {
        description: `${result.newLinks} new links merged. Total: ${result.totalAfter}`,
      })
    } else {
      toast.error("Import failed", {
        description: "Invalid export file format.",
      })
    }

    // Reset file input so the same file can be re-imported
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import / Export</DialogTitle>
          <DialogDescription>
            Export your links as a JSON file or import links from another device.
            Imports merge via CRDT -- no data is lost.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Export */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Export
            </label>
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <FileJson className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {linkCount} link{linkCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Full CRDT state, can be merged on any device
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>

          <Separator />

          {/* Import */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Import
            </label>
            <div className="flex items-center gap-3 rounded-md border border-dashed border-border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Upload className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Merge from file
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload a LinkDrop JSON export
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
              >
                {isImporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </div>

          {/* Import Summary */}
          {importSummary && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Import result: {importSummary.newLinks} new link
                {importSummary.newLinks !== 1 ? "s" : ""} added. Total:{" "}
                {importSummary.totalAfter} links.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
