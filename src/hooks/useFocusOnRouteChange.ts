import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/**
 * After a client-side navigation, moves focus to the new page's `<h1>` (or the
 * container itself) so keyboard and screen reader users land on the new
 * content. The first render is skipped so the initial page load doesn't move
 * focus. Attach the returned ref to the element that wraps the page.
 */
export function useFocusOnRouteChange<T extends HTMLElement>() {
  const containerRef = useRef<T>(null)
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (pathname === previousPathname.current) {
      return
    }
    previousPathname.current = pathname

    const container = containerRef.current
    const target = container?.querySelector('h1') ?? container
    if (target) {
      // Headings aren't focusable by default; -1 allows focus() without adding
      // them to the tab order.
      target.tabIndex = -1
      target.focus()
    }
  }, [pathname])

  return containerRef
}
