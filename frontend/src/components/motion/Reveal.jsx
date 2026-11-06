import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import useReducedMotion from '@/hooks/useReducedMotion'

/**
 * Scroll-triggered reveal powered by GSAP ScrollTrigger.
 *
 *   <Reveal>...</Reveal>                      fades + lifts the wrapper
 *   <Reveal stagger={0.12}>...</Reveal>       staggers the wrapper's direct children
 *
 * With reduced motion enabled nothing is hidden or animated.
 */
export default function Reveal({
  as: Tag = 'div',
  y = 40,
  duration = 1,
  delay = 0,
  stagger = 0,
  start = 'top 88%',
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (reduced || !el) return

      const targets = stagger ? Array.from(el.children) : el
      if (stagger && targets.length === 0) return

      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start, once: true },
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
