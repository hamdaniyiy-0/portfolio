import { useState } from 'react'
import { ArrowUpRight, Award, FolderGit2, ShieldCheck } from 'lucide-react'
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

/**
 * Section `#Portofolio` — tab bar Projects / Certificates / Tech Stack.
 * (Tab Achievements dihapus: datanya tidak ada, jadi tidak dibuat.)
 * - Projects : kartu ber-border liquid-metal + tombol "Details" -> route
 *              `/project/<judul>` (tanpa modal, sesuai perilaku referensi).
 * - Certificates : kartu sertifikat teks (tanpa gambar → tanpa viewer).
 * - Tech Stack : kartu glow tepi yang mengikuti kursor.
 */
export default function Portfolio() {
  const [tab, setTab] = useState('projects')
  useReveal({ key: tab })

  const openProject = (title) => navigate(`/project/${encodeURIComponent(title)}`)

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
                      style={{ background: p.gradient }}
                    >
                      <span className="portfolio-card-window" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      <span className="portfolio-card-thumb-body" aria-hidden="true">
                        <Icon size={54} />
                        <span>{p.category}</span>
                      </span>
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
                key={c.name}
                style={{ '--reveal-delay': `${i * 0.08}s` }}
              >
                <div className="portfolio-cert-preview">
                  <div className="portfolio-cert-paper">
                    <span className="portfolio-cert-issuer">{c.issuer}</span>
                    <h3 className="portfolio-cert-name">{c.name}</h3>
                    <span className="portfolio-cert-year">{c.year}</span>
                  </div>
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
    </section>
  )
}
