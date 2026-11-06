import { useEffect, useRef } from 'react'
import useDeviceCapabilities from '@/hooks/useDeviceCapabilities'
import './GoldParticles.css'

/**
 * Subtle drifting gold dust on a single <canvas>.
 * - Fewer particles on mobile, none at all for reduced motion
 * - Stops drawing while off-screen or when the tab is hidden
 * - Fills its positioned parent
 */
export default function GoldParticles({ count = 40, className = '' }) {
  const canvasRef = useRef(null)
  const { isMobile, reducedMotion } = useDeviceCapabilities()

  useEffect(() => {
    if (reducedMotion) return undefined
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !parent || !ctx) return undefined

    const total = Math.round(isMobile ? count * 0.5 : count)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let running = false
    let particles = []

    const make = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(0.08 + Math.random() * 0.22),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    })

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: total }, make)
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -6) {
          p.y = h + 6
          p.x = Math.random() * w
        }
        if (p.x < -6) p.x = w + 6
        if (p.x > w + 6) p.x = -6

        const a = 0.15 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.001 * p.speed + p.phase))
        if (p.r > 1.2) {
          ctx.fillStyle = `rgba(236, 212, 143, ${(a * 0.16).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = `rgba(236, 212, 143, ${a.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (t) => {
      draw(t)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running || document.hidden) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(parent)

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    visibility.observe(parent)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      resizeObserver.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [count, isMobile, reducedMotion])

  if (reducedMotion) return null
  return <canvas ref={canvasRef} className={`gold-particles ${className}`.trim()} aria-hidden="true" />
}
