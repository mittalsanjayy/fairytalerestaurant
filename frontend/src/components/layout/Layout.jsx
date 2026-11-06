import Loader from '@/components/motion/Loader'
import CustomCursor from '@/components/motion/CustomCursor'
import { useIntro } from '@/context/IntroContext'
import Header from './Header'
import Footer from './Footer'

/**
 * Site shell: intro loader, skip link, header, main landmark, footer and desktop cursor.
 * The page is inert (not focusable or readable) only while the intro plays.
 */
export default function Layout({ children }) {
  const { finished } = useIntro()

  return (
    <>
      <Loader />
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div inert={finished ? undefined : ''}>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
      <CustomCursor />
    </>
  )
}
