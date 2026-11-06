import Seo from '@/components/ui/Seo'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Menu from '@/sections/Menu'
import Offers from '@/sections/Offers'
import Celebrations from '@/sections/Celebrations'
import Gallery from '@/sections/Gallery'
import Reservations from '@/sections/Reservations'
import Contact from '@/sections/Contact'
import { SITE } from '@/config/site'

/** Home page: a stack of sections. Reservations and Contact close the page. */
export default function Home() {
  return (
    <>
      <Seo title={`${SITE.fullName} | Kammanahalli, Bengaluru`} path="/" />
      <Hero />
      <About />
      <Menu />
      <Offers />
      <Celebrations />
      <Gallery />
      <Reservations />
      <Contact />
    </>
  )
}
