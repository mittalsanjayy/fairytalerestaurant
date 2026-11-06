import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { useIntro } from '@/context/IntroContext'
import { Emblem } from '@/components/ui/BrandMark'
import GoldParticles from './GoldParticles'
import './Loader.css'

/**
 * Cinematic intro (about 4 seconds, skippable with the Skip button, Esc or Enter):
 * emerald stage -> gold dust -> emblem fades and settles in -> FAIRYTALE rises through a mask ->
 * gold line -> the two halves of the curtain part to reveal the site.
 *
 * Rendered only while the intro is active (see IntroContext for the show-once rules).
 */
export default function Loader() {
  const { finished, markReady, markFinished } = useIntro()
  if (finished) return null
  return <LoaderStage onReady={markReady} onFinished={markFinished} />
}

function LoaderStage({ onReady, onFinished }) {
  const root = useRef(null)
  const skipButton = useRef(null)
  const timeline = useRef(null)
  const exiting = useRef(false)

  const { contextSafe } = useGSAP({ scope: root })

  const exit = contextSafe((fast = false) => {
    if (exiting.current) return
    exiting.current = true
    timeline.current?.kill()

    const q = gsap.utils.selector(root)
    const fade = fast ? 0.25 : 0.55
    const open = fast ? 0.75 : 1.25
    const at = fade * 0.6

    gsap
      .timeline({ onComplete: onFinished })
      .to(q('.loader__content, .loader__skip'), { autoAlpha: 0, duration: fade, ease: 'power2.in' })
      .call(onReady, null, at)
      .to(q('.loader__panel--top'), { yPercent: -101, duration: open, ease: 'expo.inOut' }, at)
      .to(q('.loader__panel--bottom'), { yPercent: 101, duration: open, ease: 'expo.inOut' }, at)
      .to(q('.loader__particles'), { autoAlpha: 0, duration: 0.6 }, at)
  })

  // Intro sequence
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.set(q('.loader__emblem'), { autoAlpha: 0, scale: 0.84 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => exit(false) })
      tl.to(q('.loader__particles'), { opacity: 1, duration: 1 }, 0)
        .to(q('.loader__emblem'), { autoAlpha: 1, scale: 1, duration: 1.3, ease: 'expo.out' }, 0.2)
        .fromTo(q('.loader__name-inner'), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out' }, 0.8)
        .fromTo(q('.loader__sub'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.35)
        .fromTo(q('.loader__line'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 1.5)
        .to({}, { duration: 0.4 })

      timeline.current = tl
    },
    { scope: root },
  )

  // Lock page scroll while the intro plays, focus the Skip button, listen for Esc
  useEffect(() => {
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    skipButton.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') exit(true)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      html.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
    // exit is intentionally captured once; exiting.current guards re-entry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={root} className="loader" role="dialog" aria-modal="true" aria-label="Welcome to Fairytale">
      <div className="loader__panel loader__panel--top" />
      <div className="loader__panel loader__panel--bottom" />

      <div className="loader__particles" aria-hidden="true">
        <GoldParticles count={70} />
      </div>

      <div className="loader__content">
        <div className="loader__glow" aria-hidden="true" />
        <Emblem size={150} className="loader__emblem" />
        <span className="loader__name">
          <span className="loader__name-inner text-gold">FAIRYTALE</span>
        </span>
        <span className="loader__sub">CAFÉ &amp; RESTAURANT</span>
        <span className="loader__line" aria-hidden="true" />
      </div>

      <button ref={skipButton} type="button" className="loader__skip" onClick={() => exit(true)}>
        Skip intro
      </button>
    </div>
  )
}
