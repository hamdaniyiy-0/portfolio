import { ArrowUp, CodeXml } from 'lucide-react'
import { navLinks, socials, profile } from '../data/portfolio'
import './Footer.css'

const LABELS = {
  Home: 'Beranda',
  About: 'Tentang Saya',
  Portfolio: 'Portofolio',
  Contact: 'Kontak',
}

/**
 * Footer — struktur identik referensi: brand + tagline, kolom Navigasi,
 * kolom Terhubung (ikon sosial), baris bawah copyright + Kembali ke Atas.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="footer-root">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-wrap">
            <div className="footer-logo">
              <CodeXml size={18} className="footer-logo-icon" aria-hidden="true" />
              <span className="footer-brand-title">Hamdani.dev</span>
            </div>
            <p className="footer-tagline">
              Membangun pengalaman web modern dengan presisi kode, tipografi tajam, dan dimensi 3D
              interaktif.
            </p>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-heading">Navigasi</span>
            <div className="footer-links-list">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href}>
                  {LABELS[link.name] ?? link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-heading">Terhubung</span>
            <div className="footer-social-row">
              {socials.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.name}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    aria-label={s.name}
                  >
                    <Icon className="footer-social-icon" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="footer-copyright">
            © {year} {profile.name}. All rights reserved.
          </p>
          <button type="button" onClick={goTop} className="footer-back-to-top">
            <span>Kembali ke Atas</span>
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
