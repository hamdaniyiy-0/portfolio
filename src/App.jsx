import { useCallback, useEffect, useState } from 'react'
import useRoute from './hooks/useRoute'
import useReveal from './hooks/useReveal'
import { playClick } from './lib/sfx'
import WelcomeLoader from './components/WelcomeLoader'
import SpaceBackground from './components/SpaceBackground'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import SpotifySection from './components/SpotifySection'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ProjectDetail from './components/ProjectDetail'

/**
 * Aplikasi utama.
 * - Route `/project/<judul>` -> halaman detail (tanpa navbar/footer).
 * - Selain itu -> halaman utama: latar ambient + navbar + section.
 * - WelcomeLoader tampil sekali di awal (preload aset nyata), lalu
 *   seluruh konten muncul; reveal tiap section memakai IntersectionObserver.
 */
export default function App() {
  const { projectSlug } = useRoute()
  const [loading, setLoading] = useState(() => !projectSlug)
  const [ready, setReady] = useState(false)

  /* Klik global -> suara SFX (dinonaktifkan lewat toggle navbar) */
  useEffect(() => {
    const onClick = (event) => {
      if (event.target.closest('a, button, [role="button"], input, textarea, label')) playClick()
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  const finishLoading = useCallback(() => {
    setLoading(false)
    setReady(true)
  }, [])

  useReveal({ key: projectSlug ?? 'home' })

  /* Halaman detail proyek — tanpa navbar, footer, dan latar ambient */
  if (projectSlug) {
    return <ProjectDetail slug={projectSlug} />
  }

  return (
    <>
      <SpaceBackground />
      <Navbar />

      <div className="home-page-container">
        <div className="home-ui-scale">
          <main className="home-main">
            <Hero ready={ready || !loading} />
            <About />
            <Experience />
            <SpotifySection />
            <Portfolio />
            <Contact />
            <Footer />
          </main>
        </div>
      </div>

      {loading && <WelcomeLoader onDone={finishLoading} />}
    </>
  )
}
