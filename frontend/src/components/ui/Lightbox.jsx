import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { EASE } from '@/animations/presets'
import './Lightbox.css'

/**
 * Accessible full-screen image viewer.
 *   items     [{ src, alt }]
 *   index     the open image
 *   onChange  (nextIndex) => void
 *   onClose   () => void
 *
 * Esc closes, arrow keys / swipe navigate, Tab is trapped inside, page scroll is locked, and
 * focus returns to the thumbnail that opened it.
 */
export default function Lightbox({ items, index, onChange, onClose }) {
  const rootRef = useRef(null)
  const closeRef = useRef(null)
  const touchX = useRef(null)
  const count = items.length
  const item = items[index]

  const go = (delta) => onChange((index + delta + count) % count)

  // Keep the latest handlers reachable from the one-time keydown listener
  const latest = useRef({})
  latest.current = { go, onClose }

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') latest.current.onClose()
      else if (e.key === 'ArrowRight') latest.current.go(1)
      else if (e.key === 'ArrowLeft') latest.current.go(-1)
      else if (e.key === 'Tab') {
        const focusable = rootRef.current?.querySelectorAll('button:not([disabled])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      html.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [])

  const onTouchStart = (e) => {
    touchX.current = e.changedTouches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 50 && count > 1) go(dx < 0 ? 1 : -1)
  }

  return (
    <motion.div
      ref={rootRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35, ease: EASE.out } }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE.inOut } }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button type="button" className="lightbox__backdrop" tabIndex={-1} aria-hidden="true" onClick={onClose} />

      <div className="lightbox__top">
        <span className="lightbox__count" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button ref={closeRef} type="button" className="lightbox__btn" aria-label="Close photo viewer" onClick={onClose}>
          <X size={26} strokeWidth={1.5} />
        </button>
      </div>

      <figure className="lightbox__figure">
        <img key={item.src} className="lightbox__img" src={item.src} alt={item.alt} decoding="async" />
      </figure>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--prev"
            aria-label="Previous photo"
            onClick={() => go(-1)}
          >
            <ChevronLeft size={30} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--next"
            aria-label="Next photo"
            onClick={() => go(1)}
          >
            <ChevronRight size={30} strokeWidth={1.5} />
          </button>
        </>
      ) : null}
    </motion.div>
  )
}
