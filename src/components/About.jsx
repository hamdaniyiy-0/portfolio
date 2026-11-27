import { ArrowUpRight, FileText } from 'lucide-react'
import { profile } from '../data/portfolio'
import StarBorder from './StarBorder'
import './About.css'

/**
 * Section `#About` — judul display "About Me", grid 3 kolom:
 * intro (judul gradien + tombol View CV) | potret (glow/orbit/spark)
 * | bio paragraf + tombol Lihat Projek.
 * Efek Spider-Man dihapus (aset tidak ada di proyek ini).
 */
export default function About() {
  const [first, ...rest] = profile.name.split(' ')
  const last = rest.join(' ')

  return (
    <section className="about-root-section" id="About" aria-labelledby="about-section-heading">
      <h2 className="section-display-title" id="about-section-heading">
        About Me
      </h2>

      <div className="about-container-inner">
        <div className="about-intro">
          <h2 className="about-title" id="about-title">
            <span className="about-title-greeting">Hi, I&apos;m</span>
            <span>
              {first}
              <br />
              {last}
            </span>
          </h2>
          <StarBorder
            as="a"
            href="/CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View CV (PDF, terbuka di tab baru)"
            className="about-action about-action-primary hero-btn-content"
            color="#2c67ed"
            trailColor="#ffffff"
            duration={4}
            direction="clockwise"
            radius={12}
            glow={0.8}
            hover="lap"
            theme="dark"
            backgroundColor="transparent"
          >
            <FileText size={17} aria-hidden="true" />
            <span>View CV</span>
          </StarBorder>
        </div>

        <div className="about-portrait-stage">
          <div className="about-portrait-glow" aria-hidden="true" />
          <div className="about-portrait">
            <img
              className="about-person-image"
              src={profile.photos.real}
              alt={`Foto ${profile.name}`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <span className="about-portrait-orbit about-portrait-orbit-one" aria-hidden="true" />
          <span className="about-portrait-orbit about-portrait-orbit-two" aria-hidden="true" />
          <span className="about-portrait-spark" aria-hidden="true" />
        </div>

        <div className="about-bio">
          <p>
            Saya seorang <strong>junior developer</strong> yang bangun antarmuka interaktif dengan
            React, animasi halus, dan dunia 3D di browser.
          </p>
          <p>
            Belajar cepat, rapi dalam detail, dan selalu penasaran — kini menempuh pendidikan di{' '}
            <strong>SMK AL-HADIID 1 CILEUNGSI</strong>.
          </p>
          <StarBorder
            as="a"
            href="#Portofolio"
            className="about-action about-action-secondary hero-btn-content"
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
            <span>Lihat Projek</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </StarBorder>
        </div>
      </div>
    </section>
  )
}
