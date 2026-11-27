import { ExternalLink } from 'lucide-react'
import Terminal from './Terminal'
import StarBorder from './StarBorder'
import './SpotifySection.css'

/**
 * Section "Code a Little. Create a Lot." — kartu gradien 2 kolom:
 * salinan kiri + tombol "Explore My Projects" (smooth scroll ke section
 * Portofolio di halaman yang sama), terminal interaktif di kanan.
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
          <StarBorder
            as="a"
            className="spotify-open-link hero-btn-content"
            href="#Portofolio"
            onClick={goToProjects}
            color="#a1a1aa"
            trailColor="#ffffff"
            duration={5}
            direction="counterclockwise"
            radius={12}
            glow={0.4}
            hover="lap"
            theme="dark"
            backgroundColor="transparent"
          >
            <span>Explore My Projects</span>
            <ExternalLink size={16} aria-hidden="true" />
          </StarBorder>
        </div>

        <Terminal />
      </div>
    </section>
  )
}
