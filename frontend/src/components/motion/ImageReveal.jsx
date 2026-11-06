import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import useReducedMotion from '@/hooks/useReducedMotion'

/**
 * Cinematic image entrance: a curtain-style clip-path wipe from the bottom with a slow settle
 * (scale 1.2 -> 1) on the content. Plays once when scrolled into view.
 * Give the wrapper its size/aspect ratio via className; the first child is the settling layer.
 */
export default function ImageReveal({ className = '', delay = 0, children }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (reduced || !el) return
      const trigger = { trigger: el, start: 'top 85%', once: true }

      gsap.fromTo(
        el,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          delay,
          ease: 'expo.inOut',
          clearProps: 'clipPath',
          scrollTrigger: trigger,
        },
      )
      if (el.firstElementChild) {
        gsap.fromTo(
          el.firstElementChild,
          { scale: 1.2 },
          { scale: 1, duration: 1.8, delay, ease: 'power3.out', scrollTrigger: trigger },
        )
      }
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
