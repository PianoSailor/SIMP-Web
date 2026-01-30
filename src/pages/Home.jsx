import Hero from '../components/Hero'
import Events from '../components/Events'
import PerformancePromo from '../components/PerformancePromo'
import Committee from '../components/Committee'
import Explore from '../components/Explore'
import Footer from '../components/Footer'

export default function Home({ lang = 'en' }) {
  return (
    <>
      <Hero lang={lang} />
      <Events lang={lang} />
      <PerformancePromo lang={lang} />
      <Committee lang={lang} />
      <Explore lang={lang} />
      <Footer lang={lang} />
    </>
  )
}
