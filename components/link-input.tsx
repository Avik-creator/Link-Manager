'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Group, Link } from '@/lib/types'
import { GROUP_COLORS } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Plus, Link as LinkIcon, Inbox, ChevronDown, FolderPlus } from 'lucide-react'
import { isValidUrl } from '@/lib/url'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LinkInputProps {
  groups: Group[]
  activeGroupId: string | null
  onAddLink: (url: string, metadata?: Partial<Link>) => Link | null
  onAddGroup: (name: string, color: string) => Group
}

export function LinkInput({ groups, activeGroupId, onAddLink, onAddGroup }: LinkInputProps) {
  const [value, setValue] = useState('')
  const [description, setDescription] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('none')
  const [isFocused, setIsFocused] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0].value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCreateGroup = useCallback(() => {
    const name = newGroupName.trim()
    if (!name) return
    const group = onAddGroup(name, newGroupColor)
    setSelectedGroupId(group.id)
    setNewGroupName('')
    setNewGroupColor(GROUP_COLORS[0].value)
    setCreateGroupOpen(false)
    toast.success('Group created', { description: `"${name}" is ready to use.` })
  }, [newGroupName, newGroupColor, onAddGroup])

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
      if (description.trim()) {
        metadata.userDescription = description.trim()
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
    [onAddLink, selectedGroupId, description]
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
      setDescription('')
      setDetailsOpen(false)
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
        // Don't auto-submit on paste if details panel is open
        if (!detailsOpen) {
          setTimeout(() => {
            if (submitLink(text)) {
              setValue('')
              setDescription('')
            }
          }, 100)
        }
      }
    },
    [value, submitLink, detailsOpen]
  )

  return (
    <div className="border-b border-border w-full">
      <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-2 sm:px-5 sm:py-3 w-full">
        <div className="relative flex-1 min-w-0 w-full shrink-0">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !detailsOpen) {
                e.preventDefault()
                handleSubmit()
              }
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

        <div className="flex items-center gap-2">
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="w-full sm:w-36 shrink-0 text-xs" size="sm">
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
              <SelectSeparator />
              <button
                className="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCreateGroupOpen(true)
                }}
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Create new group
              </button>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground",
              detailsOpen && "text-foreground bg-accent"
            )}
            onClick={() => setDetailsOpen(!detailsOpen)}
            aria-label="Toggle description"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", detailsOpen && "rotate-180")} />
          </Button>

          <Button
            onClick={handleSubmit}
            size="icon"
            disabled={!value.trim()}
            aria-label="Add link"
            className="shrink-0 hidden sm:flex"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable description field */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleContent>
          <div className="px-3 pb-2.5 sm:px-5 sm:pb-3">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note about this link (optional)..."
              className="min-h-[60px] resize-none bg-muted/50 border-transparent text-sm focus-visible:border-ring focus-visible:ring-ring/20"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit()
                }
              }}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {'Press Ctrl+Enter to add link with note'}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Create group dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Group</DialogTitle>
            <DialogDescription>
              Create a group to organize your links.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Work, Reading, Inspiration..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGroup()
                }}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Color</label>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewGroupColor(c.value)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      newGroupColor === c.value
                        ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-105"
                    )}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.name}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
