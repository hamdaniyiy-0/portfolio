import { ExternalLink } from 'lucide-react'
import CodeWidget from './CodeWidget'
import './SpotifySection.css'

/**
 * Section "Code a Little. Create a Lot." — kartu gradien 2 kolom:
 * salinan kiri + tombol "Explore My Projects" (smooth scroll ke section
 * Portofolio di halaman yang sama), panel CodeWidget di kanan.
 */
export default function SpotifySection() {
  const goToProjects = (event) => {
    event.preventDefault()
    document.getElementById('Portofolio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="spotify-section" aria-labelledby="spotify-section-heading">
      <div className="spotify-card">
        <div className="spotify-copy">
          <h2 id="spotify-section-heading">
            Code a Little.
            <br />
            <span>Create a Lot.</span>
          </h2>
          <p className="spotify-description">
            Rasa Penasaran, ide, dan rasa penasaran selalu menemani proses saya dalam belajar,
            bereksperimen, dan menciptakan sesuatu yang baru.
          </p>
          <a
            className="spotify-open-link"
            href="#Portofolio"
            onClick={goToProjects}
          >
            <span>Explore My Projects</span>
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>

        <CodeWidget />
      </div>
    </section>
  )
}
