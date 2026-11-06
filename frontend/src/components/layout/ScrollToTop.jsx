import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Handles scrolling on navigation:
 *  - plain route change  -> jump to top
 *  - /#section link      -> smooth-scroll to that section, waiting briefly if the page
 *                           (a lazily loaded route) has not rendered it yet
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return undefined
    }

    const id = decodeURIComponent(hash.slice(1))
    let tries = 0
    let timer

    const seek = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (tries++ < 30) timer = setTimeout(seek, 50)
    }
    seek()

    return () => clearTimeout(timer)
  }, [pathname, hash])

  return null
}
