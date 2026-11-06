import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import useDeviceCapabilities from '@/hooks/useDeviceCapabilities'
import './CustomCursor.css'

const INTERACTIVE = 'a, button, [role="button"], [data-cursor]'

/**
 * Desktop-only gold ring that trails the pointer and swells over interactive elements.
 * The native cursor stays visible (better usability); never rendered on touch or reduced motion.
 */
export default function CustomCursor() {
  const ring = useRef(null)
  const { hasFinePointer, reducedMotion } = useDeviceCapabilities()
  const enabled = hasFinePointer && !reducedMotion

  useGSAP(
    () => {
      const el = ring.current
      if (!enabled || !el) return undefined

      gsap.set(el, { xPercent: -50, yPercent: -50 })
      const moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
      const moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })

      const onMove = (e) => {
        if (e.pointerType === 'touch') return
        moveX(e.clientX)
        moveY(e.clientY)
        el.classList.add('is-visible')
      }
      const onOver = (e) => {
        el.classList.toggle('is-active', Boolean(e.target.closest?.(INTERACTIVE)))
      }
      const onLeave = () => el.classList.remove('is-visible')

      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerover', onOver, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)

      return () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerover', onOver)
        document.documentElement.removeEventListener('pointerleave', onLeave)
      }
    },
    { dependencies: [enabled] },
  )

  if (!enabled) return null
  return <div ref={ring} className="cursor" aria-hidden="true" />
}
