import { useState, useEffect, useCallback, useRef } from "react"
import type { Link, Group } from "@/lib/types"
import {
  initPersistence,
  getLinks,
  addLink as addLinkToDoc,
  updateLink as updateLinkInDoc,
  deleteLink as deleteLinkFromDoc,
  observeLinks,
  getGroups,
  addGroup as addGroupToDoc,
  updateGroup as updateGroupInDoc,
  deleteGroup as deleteGroupFromDoc,
  observeGroups,
} from "@/lib/crdt/yjs-doc"

/**
 * Provides reactive access to the link and group collections stored in the Yjs CRDT document.
 * Initializes IndexedDB persistence on first mount, then subscribes to all
 * Yjs map changes so the component tree re-renders on any local or remote mutation.
 */
export function useLinks() {
  const [links, setLinks] = useState<Link[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    let unobserveLinks: (() => void) | null = null
    let unobserveGroups: (() => void) | null = null

    async function init() {
      await initPersistence()
      setLinks(getLinks())
      setGroups(getGroups())
      setIsLoaded(true)

      unobserveLinks = observeLinks(() => {
        setLinks(getLinks())
      })
      unobserveGroups = observeGroups(() => {
        setGroups(getGroups())
      })
    }

    init()

    return () => {
      unobserveLinks?.()
      unobserveGroups?.()
    }
  }, [])

  // ─── Link operations ──────────────────────────────────────────
  const addLink = useCallback(
    (url: string, metadata?: Partial<Link>): Link | null => {
      return addLinkToDoc(url, metadata)
    },
    []
  )

  const updateLink = useCallback(
    (id: string, partial: Partial<Link>): void => {
      updateLinkInDoc(id, partial)
    },
    []
  )

  const deleteLink = useCallback((id: string): void => {
    deleteLinkFromDoc(id)
  }, [])

  const moveToGroup = useCallback(
    (linkId: string, groupId: string | undefined): void => {
      updateLinkInDoc(linkId, { groupId })
    },
    []
  )

  // ─── Group operations ─────────────────────────────────────────
  const addGroup = useCallback(
    (name: string, color: string): Group => {
      return addGroupToDoc(name, color)
    },
    []
  )

  const updateGroup = useCallback(
    (id: string, partial: Partial<Group>): void => {
      updateGroupInDoc(id, partial)
    },
    []
  )

  const deleteGroup = useCallback((id: string): void => {
    deleteGroupFromDoc(id)
  }, [])

  return {
    links,
    groups,
    addLink,
    updateLink,
    deleteLink,
    moveToGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    isLoaded,
  }
}
