import { useState } from 'react'
import { Menu, Volume2, VolumeX, X, ArrowUpRight } from 'lucide-react'
import { navLinks } from '../data/portfolio'
import useScrollSpy from '../hooks/useScrollSpy'
import { isSoundEnabled, setSoundEnabled } from '../lib/sfx'
import GlassSurface from './GlassSurface'
import './Navbar.css'

const IDS = ['Home', 'About', 'Portofolio', 'Contact']

export default function Navbar({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sound, setSound] = useState(isSoundEnabled())
  const active = useScrollSpy(IDS)

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
    <header className="navbar-root">
      {/* --- NAVBAR DESKTOP --- */}
      <div className="navbar-desktop-wrapper">
        <GlassSurface
          width={450}
          height={66}
          borderRadius={38}
          backgroundOpacity={0.02}
          blur={8}
          distortionScale={-180}
          displace={0.5}
        >
          <div className="navbar-inner">
            <nav className="navbar-links">
              {navLinks.map((link) => {
                const isActive = active === (link.section || link.name)
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => goTo(e, link.href)}
                    className={`navbar-link-item${isActive ? ' is-active' : ''}`}
                  >
                    {link.name}
                  </a>
                )
              })}
            </nav>

            <span className="navbar-mobile-brand">Hamdani.dev</span>

            <div className="navbar-actions">
              <button onClick={toggleSound} className="navbar-icon-btn">
                {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button onClick={() => setMenuOpen((v) => !v)} className="navbar-mobile-toggle">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </GlassSurface>
      </div>

      {/* --- MENU MOBILE --- */}
      <div className={`navbar-mobile-menu${menuOpen ? ' is-open' : ''}`}>
        <GlassSurface
          width={window.innerWidth - 32}
          height={380}
          borderRadius={20}
          backgroundOpacity={0.02}
          blur={8}
          distortionScale={-180}
          displace={0.5}
        >
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
        </GlassSurface>
      </div>
    </header>
  )
}
