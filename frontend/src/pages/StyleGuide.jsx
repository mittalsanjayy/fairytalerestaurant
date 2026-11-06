import { ArrowRight } from 'lucide-react'
import Seo from '@/components/ui/Seo'
import Button from '@/components/ui/Button'
import GoldDivider from '@/components/ui/GoldDivider'
import SectionHeading from '@/components/ui/SectionHeading'
import BrandMark from '@/components/ui/BrandMark'
import Reveal from '@/components/motion/Reveal'
import useDeviceCapabilities from '@/hooks/useDeviceCapabilities'
import './StyleGuide.css'

const SWATCHES = [
  { name: 'Black', token: '--c-black', hex: '#030907' },
  { name: 'Emerald 950', token: '--c-emerald-950', hex: '#04120d' },
  { name: 'Emerald 900', token: '--c-emerald-900', hex: '#07211a' },
  { name: 'Emerald 800', token: '--c-emerald-800', hex: '#0b3226' },
  { name: 'Emerald 700', token: '--c-emerald-700', hex: '#0f4a37' },
  { name: 'Emerald 600', token: '--c-emerald-600', hex: '#14654a' },
  { name: 'Gold 300', token: '--c-gold-300', hex: '#ecd48f' },
  { name: 'Gold 500', token: '--c-gold-500', hex: '#c9a24b' },
  { name: 'Gold 700', token: '--c-gold-700', hex: '#7d6120' },
  { name: 'Ivory 100', token: '--c-ivory-100', hex: '#f6efdc' },
  { name: 'Ivory 300', token: '--c-ivory-300', hex: '#d9d1bb' },
  { name: 'Ivory 500', token: '--c-ivory-500', hex: '#a9a28f' },
]

export default function StyleGuide() {
  const caps = useDeviceCapabilities()

  return (
    <>
      <Seo title="Design System | Fairytale" path="/styleguide" noindex />

      <div className="sg container">
        <SectionHeading
          as="h1"
          eyebrow="Developer reference"
          title="Fairytale design system"
          lead="Development-only page. It is not included in production builds."
        />

        <section className="sg__block" aria-labelledby="sg-brand">
          <h2 id="sg-brand" className="sg__label">Brand</h2>
          <div className="sg__stage">
            <BrandMark size="lg" />
          </div>
        </section>

        <section className="sg__block" aria-labelledby="sg-colour">
          <h2 id="sg-colour" className="sg__label">Colour</h2>
          <ul className="sg__swatches">
            {SWATCHES.map((s) => (
              <li key={s.token} className="sg__swatch">
                <span className="sg__chip" style={{ background: `var(${s.token})` }} />
                <span className="sg__swatch-name">{s.name}</span>
                <code>{s.token}</code>
                <code>{s.hex}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="sg__block" aria-labelledby="sg-type">
          <h2 id="sg-type" className="sg__label">Typography</h2>
          <div className="sg__type">
            <p className="sg__display text-gold">Where every moment becomes a fairytale.</p>
            <h3 className="sg__h2">Heading two — Cormorant Garamond</h3>
            <p className="lead">
              Lead paragraph in Jost. Elegant modern sans-serif for readable, relaxed body copy that
              never competes with the serif headlines.
            </p>
            <p>Body text. Good food, great vibes, unforgettable moments.</p>
            <span className="eyebrow">Eyebrow label</span>
          </div>
        </section>

        <section className="sg__block" aria-labelledby="sg-btn">
          <h2 id="sg-btn" className="sg__label">Buttons</h2>
          <div className="sg__row">
            <Button icon={<ArrowRight size={16} />}>Reserve Your Table</Button>
            <Button variant="ghost">Explore Our Menu</Button>
            <Button size="sm">Small</Button>
            <Button size="lg" variant="ghost">Large</Button>
          </div>
        </section>

        <section className="sg__block" aria-labelledby="sg-div">
          <h2 id="sg-div" className="sg__label">Ornament</h2>
          <GoldDivider />
        </section>

        <section className="sg__block" aria-labelledby="sg-motion">
          <h2 id="sg-motion" className="sg__label">Scroll reveal (staggered)</h2>
          <Reveal className="sg__cards" stagger={0.15} y={32}>
            {['One', 'Two', 'Three'].map((n) => (
              <div key={n} className="sg__card">
                <span className="eyebrow">Card {n}</span>
                <p>Revealed with GSAP ScrollTrigger, 0.15s stagger.</p>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="sg__block" aria-labelledby="sg-device">
          <h2 id="sg-device" className="sg__label">Device capabilities (live)</h2>
          <ul className="sg__caps">
            {Object.entries(caps).map(([key, value]) => (
              <li key={key}>
                <code>{key}</code>
                <strong className={value ? 'is-on' : ''}>{String(value)}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
