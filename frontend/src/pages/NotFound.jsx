import { Home } from 'lucide-react'
import Seo from '@/components/ui/Seo'
import Button from '@/components/ui/Button'
import GoldDivider from '@/components/ui/GoldDivider'
import { SITE } from '@/config/site'
import '@/components/ui/States.css'

export default function NotFound() {
  return (
    <>
      <Seo
        title={`Page not found | ${SITE.fullName}`}
        description="The page you are looking for could not be found."
        path="/404"
        noindex
      />
      <section className="state-screen" aria-labelledby="nf-title">
        <div className="state-screen__inner">
          <span className="state-screen__code text-gold" aria-hidden="true">
            404
          </span>
          <GoldDivider />
          <h1 id="nf-title" style={{ fontSize: 'var(--fs-h2)' }}>
            This page has wandered off
          </h1>
          <p className="lead">
            The page you are looking for does not exist or has moved. Let us take you back to the
            table.
          </p>
          <div className="state-screen__actions">
            <Button to="/" icon={<Home size={16} />}>
              Back to home
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
