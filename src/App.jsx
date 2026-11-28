import { useCallback, useEffect, useState } from 'react'
import useRoute from './hooks/useRoute'
import useReveal from './hooks/useReveal'
import { playClick } from './lib/sfx'
import WelcomeLoader from './components/WelcomeLoader'
// GhostFibers dihapus karena diganti FluxLines
import FluxLines from './components/FluxLines' 
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
    <div className="app-wrapper">
      {/* BACKGROUND FLUX LINES */}
      <div 
        className="flux-lines-background-container" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: -1,
          pointerEvents: 'none' // Mencegah background menghalangi klik pada konten
        }}
      >
        <FluxLines
          colors={['#ffffff', '#ffffff', '#ffffff']}
          glow={1.6}
          rimWidth={0.2}
          lineWidth={1}
          flowDirection="down"
          mouseInteraction={false}
          clickSwirl
          speed={0.25}
          turbulence={0.6}
          shimmer={1}
        />
      </div>

      {/* KONTEN WEBSITE */}
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
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
      </div>
    </div>
  )
}