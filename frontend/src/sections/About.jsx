import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { ABOUT } from '@/config/content'
import useDeviceCapabilities from '@/hooks/useDeviceCapabilities'
import GoldDivider from '@/components/ui/GoldDivider'
import Photo from '@/components/ui/Photo'
import ImageReveal from '@/components/motion/ImageReveal'
import Parallax from '@/components/motion/Parallax'
import Reveal from '@/components/motion/Reveal'
import SplitText from '@/components/motion/SplitText'
import './About.css'

export default function About() {
  const root = useRef(null)
  const { isMobile, reducedMotion } = useDeviceCapabilities()

  // Scroll storytelling: the oversized outline wordmark drifts sideways as the section passes
  useGSAP(
    () => {
      if (reducedMotion || isMobile || !root.current) return
      gsap.fromTo(
        root.current.querySelector('.about__watermark span'),
        { xPercent: 8 },
        {
          xPercent: -8,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    },
    { scope: root, dependencies: [reducedMotion, isMobile] },
  )

  return (
    <section ref={root} id="about" className="about section" aria-labelledby="about-title">
      <div className="about__watermark" aria-hidden="true">
        <span>FAIRYTALE</span>
      </div>

      <div className="container">
        <div className="about__grid">
          <div className="about__media">
            <ImageReveal className="about__img about__img--main">
              <Parallax distance={6}>
                <Photo
                  name={ABOUT.images.main.name}
                  alt={ABOUT.images.main.alt}
                  ratio={null}
                  className="photo--fill"
                />
              </Parallax>
            </ImageReveal>

            <ImageReveal className="about__img about__img--accent" delay={0.25}>
              <Parallax distance={5}>
                <Photo
                  name={ABOUT.images.accent.name}
                  alt={ABOUT.images.accent.alt}
                  ratio={null}
                  className="photo--fill"
                />
              </Parallax>
            </ImageReveal>
          </div>

          <div className="about__copy">
            <span className="eyebrow">{ABOUT.eyebrow}</span>
            <SplitText
              id="about-title"
              as="h2"
              className="about__title"
              text={ABOUT.title}
              onScroll
              stagger={0.08}
            />
            <GoldDivider className="about__divider" />
            <Reveal className="about__text" stagger={0.14} y={26}>
              {ABOUT.paragraphs.map((paragraph) => (
                <p key={paragraph} className="lead">
                  {paragraph}
                </p>
              ))}
            </Reveal>
          </div>
        </div>

        <Reveal as="ul" className="about__pillars" stagger={0.1} y={30}>
          {ABOUT.pillars.map((pillar, i) => (
            <li key={pillar.title} className="about__pillar">
              <span className="about__pillar-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
