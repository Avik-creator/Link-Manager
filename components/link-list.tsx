"use client"

import { useMemo, useState } from "react"
import type { Link, Group } from "@/lib/types"
import { LinkItem } from "@/components/link-item"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Link as LinkIcon, ChevronRight, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkListProps {
  links: Link[]
  groups: Group[]
  isLoaded: boolean
  onDeleteLink: (id: string) => void
  onMoveToGroup: (linkId: string, groupId: string | undefined) => void
  filterGroupId: string | null // null = show all, "ungrouped" = no group, else group id
}

interface GroupSection {
  id: string
  name: string
  color: string
  links: Link[]
}

export function LinkList({
  links,
  groups,
  isLoaded,
  onDeleteLink,
  onMoveToGroup,
  filterGroupId,
}: LinkListProps) {
  // Build grouped sections
  const { sections, ungroupedLinks, filteredLinks } = useMemo(() => {
    let filtered = links

    if (filterGroupId === "ungrouped") {
      filtered = links.filter((l) => !l.groupId)
      return { sections: [], ungroupedLinks: filtered, filteredLinks: filtered }
    }

    if (filterGroupId && filterGroupId !== "all") {
      filtered = links.filter((l) => l.groupId === filterGroupId)
      const group = groups.find((g) => g.id === filterGroupId)
      if (group) {
        return {
          sections: [{ id: group.id, name: group.name, color: group.color, links: filtered }],
          ungroupedLinks: [],
          filteredLinks: filtered,
        }
      }
    }

    // "all" view: group by sections
    const groupMap = new Map<string, GroupSection>()
    for (const g of groups) {
      groupMap.set(g.id, { id: g.id, name: g.name, color: g.color, links: [] })
    }

    const ungrouped: Link[] = []
    for (const link of links) {
      if (link.groupId && groupMap.has(link.groupId)) {
        groupMap.get(link.groupId)!.links.push(link)
      } else {
        ungrouped.push(link)
      }
    }

    const secs = Array.from(groupMap.values()).filter((s) => s.links.length > 0)
    return { sections: secs, ungroupedLinks: ungrouped, filteredLinks: links }
  }, [links, groups, filterGroupId])

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading links...</p>
        </div>
      </div>
    )
  }

  if (filteredLinks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <LinkIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              {filterGroupId && filterGroupId !== "all" ? "No links in this group" : "No links yet"}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-balance">
              {filterGroupId && filterGroupId !== "all"
                ? "Move links here from the actions menu, or add new ones."
                : "Paste a URL above to save your first link. Links sync automatically with connected peers."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If filtering to a single group or ungrouped, render flat
  if (filterGroupId && filterGroupId !== "all") {
    return (
      <div className="flex-1 overflow-auto">
        {filteredLinks.map((link) => (
          <LinkItem
            key={link.id}
            link={link}
            groups={groups}
            onDelete={onDeleteLink}
            onMoveToGroup={onMoveToGroup}
          />
        ))}
      </div>
    )
  }

  // "All" view with collapsible groups
  const hasGroups = sections.length > 0
  return (
    <div className="flex-1 overflow-auto">
      {sections.map((section) => (
        <GroupCollapsibleSection
          key={section.id}
          section={section}
          groups={groups}
          onDeleteLink={onDeleteLink}
          onMoveToGroup={onMoveToGroup}
        />
      ))}

      {ungroupedLinks.length > 0 && hasGroups && (
        <UngroupedSection
          links={ungroupedLinks}
          groups={groups}
          onDeleteLink={onDeleteLink}
          onMoveToGroup={onMoveToGroup}
        />
      )}

      {ungroupedLinks.length > 0 && !hasGroups && (
        ungroupedLinks.map((link) => (
          <LinkItem
            key={link.id}
            link={link}
            groups={groups}
            onDelete={onDeleteLink}
            onMoveToGroup={onMoveToGroup}
          />
        ))
      )}
    </div>
  )
}

function GroupCollapsibleSection({
  section,
  groups,
  onDeleteLink,
  onMoveToGroup,
}: {
  section: GroupSection
  groups: Group[]
  onDeleteLink: (id: string) => void
  onMoveToGroup: (linkId: string, groupId: string | undefined) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 border-b border-border bg-muted/30 px-5 py-2 transition-colors hover:bg-muted/50">
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: section.color }}
        />
        <span className="text-xs font-semibold text-foreground">{section.name}</span>
        <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px] font-medium">
          {section.links.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {section.links.map((link) => (
          <LinkItem
            key={link.id}
            link={link}
            groups={groups}
            onDelete={onDeleteLink}
            onMoveToGroup={onMoveToGroup}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function UngroupedSection({
  links,
  groups,
  onDeleteLink,
  onMoveToGroup,
}: {
  links: Link[]
  groups: Group[]
  onDeleteLink: (id: string) => void
  onMoveToGroup: (linkId: string, groupId: string | undefined) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 border-b border-border bg-muted/30 px-5 py-2 transition-colors hover:bg-muted/50">
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
        <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">Ungrouped</span>
        <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px] font-medium">
          {links.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {links.map((link) => (
          <LinkItem
            key={link.id}
            link={link}
            groups={groups}
            onDelete={onDeleteLink}
            onMoveToGroup={onMoveToGroup}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
