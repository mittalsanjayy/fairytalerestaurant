import { Fragment, useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import useReducedMotion from '@/hooks/useReducedMotion'
import './SplitText.css'

/**
 * Masked word-by-word headline reveal (each word rises out of an invisible line).
 *
 *   play      false keeps the words hidden; flipping to true plays the reveal (used by the hero
 *             to wait for the intro curtain)
 *   onScroll  wait until the heading scrolls into view instead of playing immediately
 *
 * Accessibility: assistive tech reads one clean visually-hidden copy of the text; the animated
 * words are aria-hidden. Reduced-motion visitors see the text with no animation.
 */
export default function SplitText({
  text,
  as: Tag = 'h2',
  className = '',
  play = true,
  onScroll = false,
  delay = 0,
  stagger = 0.08,
  duration = 1.1,
  accentWords = [],
  ...rest
}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const words = text.split(' ')

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      const inner = ref.current.querySelectorAll('.split__inner')

      if (!play) {
        gsap.set(inner, { yPercent: 115 })
        return
      }

      gsap.fromTo(
        inner,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration,
          delay,
          stagger,
          ease: 'expo.out',
          ...(onScroll
            ? { scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } }
            : {}),
        },
      )
    },
    { scope: ref, dependencies: [play, reduced] },
  )

  return (
    <Tag ref={ref} className={`split ${className}`.trim()} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="split__word">
              <span
                className={`split__inner ${accentWords.includes(word) ? 'split__inner--accent text-gold' : ''}`.trim()}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  )
}
