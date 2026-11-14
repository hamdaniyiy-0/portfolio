import { useEffect, useState } from 'react'
import { Menu, Volume2, VolumeX, X, ArrowUpRight } from 'lucide-react'
import { navLinks } from '../data/portfolio'
import useScrollSpy from '../hooks/useScrollSpy'
import { isSoundEnabled, setSoundEnabled } from '../lib/sfx'
import './Navbar.css'

const IDS = ['Home', 'About', 'Portofolio', 'Contact']

/**
 * Navbar pill kaca compact — struktur & perilaku:
 * - fixed melayang di tengah atas (top 20px), transisi .3s cubic-bezier(.16,1,.3,1)
 * - 4 link (Home/About/Portfolio/Contact) + pill kapsul saat aktif
 * - toggle suara SFX (kapsul kaca, tombol bulat 28px)
 * - <=767px: brand di tengah, hamburger, menu dropdown max-height 380px
 */
export default function Navbar({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sound, setSound] = useState(isSoundEnabled())
  const active = useScrollSpy(IDS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = (event, href) => {
    event.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    if (onNavigate) onNavigate(href)
  }

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    setSoundEnabled(next)
  }

  return (
    <header className={`navbar-root${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className="navbar-container glass-surface--fallback">
        <div className="glass-surface__content">
          <nav className="navbar-links" aria-label="Navigasi utama">
            {navLinks.map((link) => {
              const isActive = active === (link.section || link.name)
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => goTo(e, link.href)}
                  className={`navbar-link-item${isActive ? ' is-active' : ''}`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="navbar-active-pill" />}
                </a>
              )
            })}
          </nav>

          <span className="navbar-mobile-brand" aria-label="Hamdani.dev">
            Hamdani.dev
          </span>

          <div className="navbar-actions">
            <button
              type="button"
              onClick={toggleSound}
              className="navbar-icon-btn"
              title={sound ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
              aria-label={sound ? 'Matikan suara' : 'Nyalakan suara'}
              aria-pressed={sound}
            >
              {sound ? <Volume2 size={16} className="navbar-sound-on" /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              className="navbar-mobile-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigasi"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`navbar-mobile-menu${menuOpen ? ' is-open' : ''}`}>
        <div className="navbar-mobile-glass glass-surface--fallback">
          <div className="glass-surface__content">
            <div className="navbar-mobile-inner">
              {navLinks.map((link) => {
                const isActive = active === (link.section || link.name)
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => goTo(e, link.href)}
                    className={`navbar-mobile-link${isActive ? ' is-active' : ''}`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="navbar-mobile-indicator" />}
                  </a>
                )
              })}
              <div className="navbar-mobile-footer">
                <a href="#Contact" className="navbar-mobile-cta" onClick={(e) => goTo(e, '#Contact')}>
                  <span>Hubungi Saya</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
