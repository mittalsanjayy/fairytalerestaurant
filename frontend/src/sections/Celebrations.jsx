import { CalendarCheck, MessageCircle } from 'lucide-react'
import { CELEBRATIONS } from '@/config/content'
import { whatsappLink } from '@/config/site'
import Button from '@/components/ui/Button'
import GoldDivider from '@/components/ui/GoldDivider'
import Photo from '@/components/ui/Photo'
import ImageReveal from '@/components/motion/ImageReveal'
import Reveal from '@/components/motion/Reveal'
import SplitText from '@/components/motion/SplitText'
import './Celebrations.css'

/** Pre-selects the occasion in the reservation form; the #reserve link does the scrolling. */
const prefillReservation = (occasion) =>
  window.dispatchEvent(new CustomEvent('fairytale:reserve', { detail: { occasion } }))

export default function Celebrations() {
  return (
    <section id="celebrations" className="celebrations section" aria-labelledby="celebrations-title">
      <div className="container">
        <header className="celebrations__head">
          <span className="eyebrow eyebrow--center">{CELEBRATIONS.eyebrow}</span>
          <SplitText
            id="celebrations-title"
            as="h2"
            className="celebrations__title"
            text={CELEBRATIONS.title}
            onScroll
            stagger={0.08}
          />
          <GoldDivider />
          <Reveal>
            <p className="lead celebrations__lead">{CELEBRATIONS.lead}</p>
          </Reveal>
        </header>

        <ul className="celebrations__grid">
          {CELEBRATIONS.occasions.map((occasion, i) => (
            <li key={occasion.id} className="celebrations__item">
              <article className="celebrations__card">
                <ImageReveal className="celebrations__img" delay={(i % 2) * 0.15}>
                  <Photo
                    name={occasion.image.name}
                    alt={occasion.image.alt}
                    ratio={null}
                    className="photo--fill"
                  />
                </ImageReveal>
                <div className="celebrations__body">
                  <span className="celebrations__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3>{occasion.title}</h3>
                  <p>{occasion.text}</p>
                  <div className="celebrations__actions">
                  <Button
                    size="sm"
                    to="/#reserve"
                    onClick={() => prefillReservation(occasion.reserveOccasion)}
                    icon={<CalendarCheck size={14} />}
                    aria-label={`${CELEBRATIONS.reserveLabel}: ${occasion.title}`}
                  >
                    {CELEBRATIONS.reserveLabel}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    href={whatsappLink(occasion.message)}
                    icon={<MessageCircle size={14} />}
                    aria-label={`${CELEBRATIONS.cta.label}: ${occasion.title}`}
                  >
                    {CELEBRATIONS.cta.label}
                  </Button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
