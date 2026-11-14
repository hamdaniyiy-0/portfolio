import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowRight, Send } from 'lucide-react'
import { profile, socials } from '../data/portfolio'
import useTypewriter from '../hooks/useTypewriter'
import './Hero.css'

// Komponen 3D dimuat terpisah agar beban awal ringan
const LanyardBadge = lazy(() => import('./LanyardBadge'))

/**
 * Hero (`#Home`) — identik struktur referensi:
 * lanyard (absolute inset0 z4, di atas teks tapi pointer-events none)
 * lalu grid 1.12fr/.88fr: judul dua baris, typewriter, deskripsi,
 * tombol aksi, dan baris "Find me" + ikon sosial.
 */
export default function Hero({ ready = true }) {
  const typed = useTypewriter(profile.roles)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <section className="hero-root-section" id="Home">
      {/* Lanyard 3D — dipertahankan dari proyek lama (React Bits + three.js) */}
      {ready && (
        <div className={`lanyard-card-container${isMobile ? ' is-mobile' : ''}`}>
          <Suspense fallback={<span className="lanyard-pending" aria-hidden="true" />}>
            <LanyardBadge />
          </Suspense>
        </div>
      )}

      <div className="hero-container-inner">
        <div className="hero-text-col">
          <div className="hero-heading-group">
            <h1 className="hero-h1-gradient">{profile.welcome[0]}</h1>
            <h1 className="hero-h1-white">{profile.welcome[1]}</h1>
          </div>

          <div className="hero-typewriter-row">
            <span className="hero-typewriter-text">{typed}</span>
            <span className="hero-typewriter-cursor" aria-hidden="true" />
          </div>

          <p className="hero-description-copy">{profile.bio}</p>

          <div className="hero-action-row">
            <a href="#Portofolio" className="hero-btn-primary">
              <span>Lihat Projek</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href="#Contact" className="hero-btn-secondary">
              <span>Hubungi Saya</span>
              <Send size={15} aria-hidden="true" />
            </a>
          </div>

          <div className="hero-find-me-wrap">
            <span className="hero-find-me-label">Find me</span>
            <div className="hero-social-buttons">
              {socials.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.name}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-social-icon-btn"
                    aria-label={s.name}
                    title={s.name}
                  >
                    <Icon className="hero-social-svg" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
