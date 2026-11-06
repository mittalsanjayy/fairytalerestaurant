import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import useDeviceCapabilities from '@/hooks/useDeviceCapabilities'
import './Parallax.css'

/**
 * Parallax frame: its content drifts slowly against the scroll inside a clipped window.
 * The inner layer is 24% taller than the frame so the drift never exposes an edge.
 *
 * Keep `distance` at 10 or below. Half the distance is used on mobile; none for reduced motion.
 * Children should fill their parent (e.g. an <img> with object-fit: cover).
 */
export default function Parallax({
  distance = 8,
  start = 'top bottom',
  end = 'bottom top',
  className = '',
  children,
}) {
  const frame = useRef(null)
  const inner = useRef(null)
  const { isMobile, reducedMotion } = useDeviceCapabilities()

  useGSAP(
    () => {
      if (reducedMotion || !inner.current) return
      const d = isMobile ? distance * 0.5 : distance
      gsap.fromTo(
        inner.current,
        { yPercent: -d },
        {
          yPercent: d,
          ease: 'none',
          scrollTrigger: { trigger: frame.current, start, end, scrub: true },
        },
      )
    },
    { scope: frame, dependencies: [reducedMotion, isMobile, distance] },
  )

  return (
    <div ref={frame} className={`parallax ${className}`.trim()}>
      <div ref={inner} className="parallax__inner">
        {children}
      </div>
    </div>
  )
}
