import { useState, useEffect, useCallback, useRef } from "react"
import type { Link } from "@/lib/types"
import {
  initPersistence,
  getLinks,
  addLink as addLinkToDoc,
  updateLink as updateLinkInDoc,
  deleteLink as deleteLinkFromDoc,
  observeLinks,
} from "@/lib/crdt/yjs-doc"

/**
 * Provides reactive access to the link collection stored in the Yjs CRDT document.
 * Initializes IndexedDB persistence on first mount, then subscribes to all
 * Yjs map changes so the component tree re-renders on any local or remote mutation.
 */
export function useLinks() {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    let unobserve: (() => void) | null = null

    async function init() {
      await initPersistence()
      setLinks(getLinks())
      setIsLoaded(true)

      unobserve = observeLinks(() => {
        setLinks(getLinks())
      })
    }

    init()

    return () => {
      unobserve?.()
    }
  }, [])

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

  return { links, addLink, updateLink, deleteLink, isLoaded }
}
