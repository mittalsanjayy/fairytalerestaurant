import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Coordinates the cinematic intro with the rest of the page.
 *
 *  ready     -> the intro curtain has started opening; the hero may begin its entrance
 *  finished  -> the intro is gone (or was never needed)
 *
 * The intro plays only on the first visit of a browser session, only when the visit starts on
 * the home page, and never for visitors who prefer reduced motion. Navigating around the site
 * never replays it.
 */
const SEEN_KEY = 'fairytale:intro-seen'

function shouldPlayIntro() {
  try {
    if (window.location.pathname !== '/') return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return false
  }
}

const IntroContext = createContext({ ready: true, finished: true, markReady() {}, markFinished() {} })

export function IntroProvider({ children }) {
  const [play] = useState(shouldPlayIntro)
  const [ready, setReady] = useState(!play)
  const [finished, setFinished] = useState(!play)

  const markReady = useCallback(() => setReady(true), [])
  const markFinished = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* storage unavailable: intro may replay, which is harmless */
    }
    setReady(true)
    setFinished(true)
  }, [])

  const value = useMemo(
    () => ({ ready, finished, markReady, markFinished }),
    [ready, finished, markReady, markFinished],
  )

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export const useIntro = () => useContext(IntroContext)
