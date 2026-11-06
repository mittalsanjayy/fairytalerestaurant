import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap'
import { getImage } from '@/lib/images'
import { HERO } from '@/config/content'
import { useIntro } from '@/context/IntroContext'
import useReducedMotion from '@/hooks/useReducedMotion'
import Button from '@/components/ui/Button'
import Parallax from '@/components/motion/Parallax'
import SplitText from '@/components/motion/SplitText'
import GoldParticles from '@/components/motion/GoldParticles'
import './Hero.css'

// Warm hanging lights for the fallback scene shown until the client's interior photo is added.
const LAMPS = [
  { x: 9, len: 17, delay: 0 },
  { x: 21, len: 29, delay: -2 },
  { x: 34, len: 14, delay: -4 },
  { x: 50, len: 24, delay: -1 },
  { x: 66, len: 15, delay: -3 },
  { x: 79, len: 31, delay: -5 },
  { x: 91, len: 19, delay: -2.5 },
]

function Sparkle({ className }) {
  return (
    <svg className={`hero__sparkle ${className}`} width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z" fill="currentColor" />
    </svg>
  )
}

export default function Hero() {
  const root = useRef(null)
  const { ready } = useIntro()
  const reduced = useReducedMotion()
  const image = getImage(HERO.image.name)

  useGSAP(
    () => {
      if (reduced || !root.current) return
      const q = gsap.utils.selector(root)
      const mediaFrom = { scale: 1.25, clipPath: 'inset(14% 10% 14% 10%)' }
      const fadeFrom = { autoAlpha: 0, y: 26 }

      // Hold everything back until the intro curtain starts to open
      if (!ready) {
        gsap.set(q('.hero__media'), mediaFrom)
        gsap.set(q('.hero__fade'), fadeFrom)
        return
      }

      const tl = gsap.timeline()
      tl.fromTo(
        q('.hero__media'),
        mediaFrom,
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.9, ease: 'expo.inOut', clearProps: 'clipPath' },
        0,
      )
        .to(q('.hero__media'), { scale: 1, duration: 2.8, ease: 'power3.out' }, 0)
        .fromTo(
          q('.hero__fade'),
          fadeFrom,
          { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.14, ease: 'power3.out' },
          0.9,
        )

      // Hero content eases up and away as the visitor scrolls on
      gsap.to(q('.hero__content'), {
        y: -70,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 35%', scrub: true },
      })
    },
    { scope: root, dependencies: [ready, reduced] },
  )

  return (
    <section ref={root} className="hero" aria-label="Welcome to Fairytale Café & Restaurant">
      <Parallax className="hero__bg" distance={8}>
        <div className="hero__media">
          {image ? (
            <img
              className="hero__img"
              src={image}
              alt={HERO.image.alt}
              fetchpriority="high"
              decoding="async"
            />
          ) : (
            <div className="hero__scene" aria-hidden="true">
              {LAMPS.map((lamp, i) => (
                <span
                  key={i}
                  className="hero__lamp"
                  style={{ '--x': `${lamp.x}%`, '--len': `${lamp.len}vh`, '--delay': `${lamp.delay}s` }}
                >
                  <i />
                </span>
              ))}
            </div>
          )}
        </div>
      </Parallax>

      <div className="hero__shade" aria-hidden="true" />
      <GoldParticles count={46} />
      <div className="hero__frame" aria-hidden="true" />
      <Sparkle className="hero__sparkle--a" />
      <Sparkle className="hero__sparkle--b" />

      <div className="hero__content container">
        <span className="eyebrow eyebrow--center hero__fade">{HERO.eyebrow}</span>

        <SplitText
          as="h1"
          className="hero__title"
          text={HERO.title}
          accentWords={HERO.accentWords}
          play={ready}
          delay={0.45}
          stagger={0.09}
          duration={1.2}
        />

        <p className="lead hero__text hero__fade">{HERO.text}</p>

        <div className="hero__actions hero__fade">
          <Button to={HERO.primaryCta.to} size="lg" icon={<ArrowRight size={16} />}>
            {HERO.primaryCta.label}
          </Button>
          <Button to={HERO.secondaryCta.to} size="lg" variant="ghost">
            {HERO.secondaryCta.label}
          </Button>
        </div>
      </div>

      <Link to="/#about" className="hero__scroll hero__fade" aria-label="Scroll to our story">
        <span>Scroll</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </Link>
    </section>
  )
}
