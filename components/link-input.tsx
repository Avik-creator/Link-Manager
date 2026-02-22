'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Link as LinkIcon } from 'lucide-react'
import { isValidUrl } from '@/lib/url'
import { toast } from 'sonner'

interface LinkInputProps {
  onAddLink: (url: string) => ReturnType<typeof Function> | null
}

export function LinkInput({ onAddLink }: LinkInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(() => {
    const url = value.trim()
    if (!url) return

    if (!isValidUrl(url)) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid HTTP or HTTPS URL.',
      })
      return
    }

    const result = onAddLink(url)
    if (result === null) {
      toast.info('Duplicate link', {
        description: 'This link already exists in your collection.',
      })
      return
    }

    setValue('')
    toast.success('Link added', {
      description: url.length > 60 ? url.slice(0, 60) + '...' : url,
    })
  }, [value, onAddLink])

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
          const result = onAddLink(text)
          if (result === null) {
            toast.info('Duplicate link', {
              description: 'This link already exists in your collection.',
            })
          } else if (result) {
            setValue('')
            toast.success('Link added', {
              description: text.length > 60 ? text.slice(0, 60) + '...' : text,
            })
          }
        }, 100)
      }
    },
    [value, onAddLink]
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
      <Button
        onClick={handleSubmit}
        size="icon"
        disabled={!value.trim()}
        aria-label="Add link"
        className="bg-primary text-primary-foreground hover:bg-primary-700 shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
