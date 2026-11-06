import { MessageCircle, Phone, Sparkles } from 'lucide-react'
import { OFFERS } from '@/config/content'
import usePublicContent from '@/hooks/usePublicContent'
import { SITE, whatsappLink } from '@/config/site'
import Button from '@/components/ui/Button'
import GoldDivider from '@/components/ui/GoldDivider'
import Reveal from '@/components/motion/Reveal'
import SplitText from '@/components/motion/SplitText'
import './Offers.css'

export default function Offers() {
  const { offers: liveOffers } = usePublicContent()
  const items = liveOffers.length > 0 ? liveOffers : OFFERS.items
  const hasOffers = items.length > 0

  return (
    <section id="offers" className="offers section" aria-labelledby="offers-title">
      <div className="container">
        <header className="offers__head">
          <span className="eyebrow eyebrow--center">{OFFERS.eyebrow}</span>
          <SplitText id="offers-title" as="h2" className="offers__title" text={OFFERS.title} onScroll stagger={0.08} />
          <GoldDivider />
          {hasOffers ? (
            <Reveal>
              <p className="lead offers__lead">{OFFERS.lead}</p>
            </Reveal>
          ) : null}
        </header>

        {hasOffers ? (
          <Reveal as="ul" className="offers__grid" stagger={0.12} y={34}>
            {items.map((offer) => (
              <li key={offer.title} className="offers__card">
                <Sparkles size={20} aria-hidden="true" className="offers__icon" />
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                {offer.terms ? <small>{offer.terms}</small> : null}
              </li>
            ))}
          </Reveal>
        ) : (
          <Reveal className="offers__empty" y={34}>
            <span className="offers__orn" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <h3>{OFFERS.empty.title}</h3>
            <p className="lead">{OFFERS.empty.text}</p>
            <div className="offers__actions">
              <Button
                href={whatsappLink(OFFERS.empty.whatsappMessage)}
                icon={<MessageCircle size={16} />}
              >
                Message on WhatsApp
              </Button>
              <Button href={SITE.phoneHref} variant="ghost" icon={<Phone size={15} />}>
                Call Us
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
