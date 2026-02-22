'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Group, Link } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Link as LinkIcon, Inbox } from 'lucide-react'
import { isValidUrl } from '@/lib/url'
import { toast } from 'sonner'

interface LinkInputProps {
  groups: Group[]
  activeGroupId: string | null
  onAddLink: (url: string, metadata?: Partial<Link>) => Link | null
}

export function LinkInput({ groups, activeGroupId, onAddLink }: LinkInputProps) {
  const [value, setValue] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('none')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // When the active filter changes, auto-select the target group
  useEffect(() => {
    if (activeGroupId && activeGroupId !== 'all' && activeGroupId !== 'ungrouped') {
      setSelectedGroupId(activeGroupId)
    } else {
      setSelectedGroupId('none')
    }
  }, [activeGroupId])

  const submitLink = useCallback(
    (url: string) => {
      const metadata: Partial<Link> = {}
      if (selectedGroupId !== 'none') {
        metadata.groupId = selectedGroupId
      }
      const result = onAddLink(url, metadata)
      if (result === null) {
        toast.info('Duplicate link', {
          description: 'This link already exists in your collection.',
        })
        return false
      }
      toast.success('Link added', {
        description: url.length > 60 ? url.slice(0, 60) + '...' : url,
      })
      return true
    },
    [onAddLink, selectedGroupId]
  )

  const handleSubmit = useCallback(() => {
    const url = value.trim()
    if (!url) return

    if (!isValidUrl(url)) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid HTTP or HTTPS URL.',
      })
      return
    }

    if (submitLink(url)) {
      setValue('')
    }
  }, [value, submitLink])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text').trim()
      if (isValidUrl(text) && !value) {
        e.preventDefault()
        setValue(text)
        setTimeout(() => {
          if (submitLink(text)) {
            setValue('')
          }
        }, 100)
      }
    },
    [value, submitLink]
  )

  return (
    <div className="flex items-center gap-2 border-b border-border px-5 py-3">
      <div className="relative flex-1">
        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Paste or type a URL..."
          className="pl-9 pr-4 bg-muted/50 border-transparent focus-visible:border-ring focus-visible:ring-ring/20"
        />
        {!isFocused && !value && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-0.5 rounded-sm border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">{'Ctrl+K'}</span>
          </kbd>
        )}
      </div>

      {groups.length > 0 && (
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-36 shrink-0 text-xs" size="sm">
            <SelectValue placeholder="No group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="flex items-center gap-2">
                <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
                No group
              </span>
            </SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        onClick={handleSubmit}
        size="icon"
        disabled={!value.trim()}
        aria-label="Add link"
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
