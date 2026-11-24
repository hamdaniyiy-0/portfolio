import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Award,
  FolderGit2,
  ImageOff,
  Maximize2,
  ShieldCheck,
  X,
} from 'lucide-react'
import { projects, certificates, techStack } from '../data/portfolio'
import { navigate } from '../hooks/useRoute'
import useReveal from '../hooks/useReveal'
import BorderGlowCard from './BorderGlowCard'
import LiquidMetalBorder from './LiquidMetalBorder'
import Logo from './Logos'
import './Portfolio.css'

const TABS = [
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'certificates', label: 'Certificates', icon: ShieldCheck },
  { id: 'skills', label: 'Tech Stack', icon: Award },
]

/** Gambar sertifikat dengan fallback bila file belum tersedia. */
function CertificateThumb({ certificate, onOpen }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="portfolio-cert-media portfolio-cert-media--fallback">
        <span className="portfolio-cert-fallback">
          <ImageOff size={30} aria-hidden="true" />
          <span>Gambar sertifikat belum tersedia</span>
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="portfolio-cert-media"
      onClick={() => onOpen(certificate)}
      aria-label={`Perbesar sertifikat ${certificate.title}`}
    >
      <img
        className="portfolio-cert-image"
        src={certificate.image}
        alt={`Sertifikat ${certificate.title} — ${certificate.issuer}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
      <span className="portfolio-cert-zoom" aria-hidden="true">
        <Maximize2 size={15} />
        Lihat
      </span>
    </button>
  )
}

/**
 * Section `#Portofolio` — tab bar Projects / Certificates / Tech Stack.
 * (Tab Achievements dihapus: datanya tidak ada, jadi tidak dibuat.)
 * - Projects : kartu ber-border liquid-metal + tombol "Details" -> route
 *              `/project/<judul>` (tanpa modal, sesuai perilaku referensi).
 * - Certificates : kartu bergambar + lightbox (klik gambar untuk memperbesar).
 * - Tech Stack : kartu glow tepi yang mengikuti kursor.
 */
export default function Portfolio() {
  const [tab, setTab] = useState('projects')
  const [activeCert, setActiveCert] = useState(null)
  useReveal({ key: tab })

  const openProject = (title) => navigate(`/project/${encodeURIComponent(title)}`)

  /** Tutup lightbox dengan Esc + kunci scroll halaman selama terbuka. */
  useEffect(() => {
    if (!activeCert) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveCert(null)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeCert])

  return (
    <section className="portfolio-root-section" id="Portofolio" aria-labelledby="portfolio-section-heading">
      <div className="portfolio-container-inner">
        <h2 className="section-display-title reveal" id="portfolio-section-heading">
          Portfolio
        </h2>

        <div className="portfolio-tab-bar" role="tablist" aria-label="Kategori portofolio">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`portfolio-tab-btn${active ? ' is-active' : ''}`}
              >
                <Icon size={22} aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {tab === 'projects' && (
          <div className="portfolio-cards-grid" role="tabpanel">
            {projects.map((p, i) => {
              const Icon = p.icon
              return (
                <article
                  className="portfolio-project-card reveal"
                  key={p.title}
                  style={{ '--reveal-delay': `${i * 0.08}s` }}
                >
                  <LiquidMetalBorder className="portfolio-project-metal-border" />
                  <div className="portfolio-project-card-content">
                    <div
                      className="portfolio-card-thumbnail"
                      style={p.image ? undefined : { background: p.gradient }}
                    >
                      {p.image && (
                        <img
                          className="portfolio-card-cover"
                          src={p.image}
                          alt={`Tampilan ${p.title}`}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <span className="portfolio-card-window" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      {!p.image && (
                        <span className="portfolio-card-thumb-body" aria-hidden="true">
                          <Icon size={54} />
                          <span>{p.category}</span>
                        </span>
                      )}
                    </div>
                    <div className="portfolio-card-body">
                      <h3 className="portfolio-card-title">{p.title}</h3>
                      <p className="portfolio-card-desc">{p.description}</p>
                      <button
                        type="button"
                        className="portfolio-details-btn"
                        onClick={() => openProject(p.title)}
                      >
                        <span>Details</span>
                        <ArrowUpRight size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {tab === 'certificates' && (
          <div className="portfolio-certificates-grid" role="tabpanel">
            {certificates.map((c, i) => (
              <article
                className="portfolio-cert-card reveal"
                key={c.title}
                style={{ '--reveal-delay': `${i * 0.08}s` }}
              >
                <CertificateThumb certificate={c} onOpen={setActiveCert} />

                <div className="portfolio-cert-body">
                  <div className="portfolio-cert-meta">
                    <span className="portfolio-cert-issuer">{c.issuer}</span>
                    <span className="portfolio-cert-date">{c.date}</span>
                  </div>
                  <h3 className="portfolio-cert-title">{c.title}</h3>
                  <p className="portfolio-cert-desc">{c.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'skills' && (
          <div className="portfolio-skills-grid" role="tabpanel">
            {techStack.map((s, i) => (
              <BorderGlowCard
                key={s.name}
                className="portfolio-skill-card reveal"
                style={{ '--card-bg': '#0e1625', '--reveal-delay': `${(i % 6) * 0.05}s` }}
              >
                <div className="portfolio-skill-card-content">
                  <span className="portfolio-skill-mark" aria-hidden="true">
                    <Logo name={s.logo} className="portfolio-skill-logo" />
                  </span>
                  <p className="portfolio-skill-name">{s.name}</p>
                </div>
              </BorderGlowCard>
            ))}
          </div>
        )}
      </div>

      {/* ============ Lightbox sertifikat ============ */}
      {activeCert && (
        <div className="portfolio-cert-modal" onClick={() => setActiveCert(null)}>
          <figure
            className="portfolio-cert-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Sertifikat ${activeCert.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="portfolio-cert-modal-close"
              onClick={() => setActiveCert(null)}
              aria-label="Tutup pratinjau sertifikat"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <img
              className="portfolio-cert-modal-image"
              src={activeCert.image}
              alt={`Sertifikat ${activeCert.title} — ${activeCert.issuer}`}
            />

            <figcaption className="portfolio-cert-modal-caption">
              <strong>{activeCert.title}</strong>
              <span>
                {activeCert.issuer} · {activeCert.date}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}
