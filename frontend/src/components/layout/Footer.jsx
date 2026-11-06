import { Link } from 'react-router-dom'
import { Instagram, MapPin, Phone } from 'lucide-react'
import BrandMark from '@/components/ui/BrandMark'
import GoldDivider from '@/components/ui/GoldDivider'
import { liveLinks } from '@/config/nav'
import { SITE, mapsDirectionsUrl } from '@/config/site'
import './Footer.css'

export default function Footer() {
  const links = liveLinks()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <BrandMark size="md" />
            <GoldDivider />
            <p className="footer__tagline">{SITE.tagline}</p>
          </div>

          <div className="footer__col">
            <h2 className="footer__title">Visit</h2>
            <address className="footer__address">
              {SITE.address.line1}
              <br />
              {SITE.address.line2}
              <br />
              {SITE.address.city}, {SITE.address.state} {SITE.address.postalCode}
            </address>
            <a
              className="footer__link"
              href={mapsDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={15} aria-hidden="true" /> Get directions
            </a>
          </div>

          <div className="footer__col">
            <h2 className="footer__title">Connect</h2>
            <ul className="footer__list">
              <li>
                <a className="footer__link" href={SITE.phoneHref}>
                  <Phone size={15} aria-hidden="true" /> {SITE.phone}
                </a>
              </li>
              <li>
                <a className="footer__link" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram size={15} aria-hidden="true" /> Instagram
                </a>
              </li>
              <li>
                <a className="footer__link" href={SITE.zomato} target="_blank" rel="noopener noreferrer">
                  Order on Zomato
                </a>
              </li>
            </ul>
          </div>

          {links.length > 0 ? (
            <div className="footer__col">
              <h2 className="footer__title">Explore</h2>
              <ul className="footer__list">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link className="footer__link" to={link.to}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="footer__bar">
          <p>
            © {new Date().getFullYear()} {SITE.fullName}. All rights reserved.
          </p>
          {import.meta.env.DEV ? (
            <Link className="footer__link" to="/styleguide">
              Design system (dev)
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
