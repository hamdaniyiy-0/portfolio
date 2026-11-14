import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowUpRight,
  Building2,
  Ellipsis,
  GraduationCap,
  ShieldCheck,
  Trophy,
  X,
} from 'lucide-react'
import { certificates, education, experience, projects, stats } from '../data/portfolio'
import './Experience.css'

/**
 * Section Education + Experience + statistik.
 *
 * - Timeline dua kolom (Education | Experience) dengan nomor urut melingkar,
 *   badge tahun kaca, dan kontur topografi di latar.
 * - Kartu folder 3D: tumpukan kertas asli (proyek/sertifikat) yang mekar ke
 *   atas saat hover / "Open folder", tiap lembar bisa diklik untuk modal.
 * - Tombol tiga titik membuka dropdown dengan click-outside listener.
 *
 * Catatan konten: `experience` di portfolio.js masih kosong, jadi kolom
 * Experience belum dirender (tidak ada data karangan). Begitu diisi, kolom
 * kanan otomatis muncul dengan desain yang sama.
 */

/* ============ Latar kontur topografi (dekoratif) ============ */
const CONTOUR_SCALES = [1, 0.84, 0.69, 0.56, 0.44, 0.34, 0.25, 0.17, 0.1]
const CONTOUR_CLUSTERS = [
  { x: 120, y: 80, rotate: -12 },
  { x: 470, y: 330, rotate: -6 },
  { x: 1000, y: 190, rotate: 14 },
  { x: 760, y: 580, rotate: 16 },
  { x: 1340, y: 110, rotate: 6 },
  { x: 280, y: 720, rotate: 24 },
]

function ContourBackdrop() {
  return (
    <svg
      className="experience-contours"
      viewBox="0 0 1440 720"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path
          id="experience-contour-shape"
          d="M0-92C34-94 66-70 78-38 90-6 80 30 54 54 28 78-10 92-42 82-74 72-96 40-94 4-92-32-66-68-32-84-22-89-11-92 0-92Z"
          fill="none"
          stroke="rgba(255,255,255,0.11)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </defs>
      {CONTOUR_CLUSTERS.map((cluster, i) => (
        <g key={i} transform={`translate(${cluster.x} ${cluster.y}) rotate(${cluster.rotate})`}>
          {CONTOUR_SCALES.map((scale, j) => (
            <use key={j} href="#experience-contour-shape" transform={`scale(${scale})`} />
          ))}
        </g>
      ))}
    </svg>
  )
}

/* ============ Timeline ============ */
/* Logo sekolah: pakai file `item.logo` bila ada; jika gagal dimuat,
   kembali ke ikon Lucide supaya tidak pernah muncul gambar rusak. */
function TimelineLogo({ item, FallbackIcon }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(item.logo) && !failed

  return (
    <span className="timeline-logo" aria-hidden="true">
      {showImage ? (
        <img src={item.logo} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <FallbackIcon size={16} />
      )}
    </span>
  )
}

function TimelineItem({ item, index, active, onActivate, FallbackIcon }) {
  return (
    <li
      className={`timeline-item${active ? ' is-active' : ''}`}
      onClick={onActivate}
    >
      <div className="timeline-rail">
        <button
          type="button"
          className="timeline-index"
          onClick={onActivate}
          onFocus={onActivate}
          aria-pressed={active}
          aria-label={`Tampilkan riwayat ${item.name}`}
        >
          {index + 1}
        </button>
      </div>

      <div className="timeline-panel">
        <div className="timeline-head">
          <TimelineLogo item={item} FallbackIcon={FallbackIcon} />
          <h3 title={item.name}>{item.name}</h3>
          <span className="timeline-badge">{item.years}</span>
        </div>
        <p className="timeline-role">{item.role}</p>
        {item.tag && <span className="timeline-tag">{item.tag}</span>}
        {item.detail && <p className="timeline-detail">{item.detail}</p>}
      </div>
    </li>
  )
}

function Timeline({ title, items }) {
  const FallbackIcon = title === 'Education' ? GraduationCap : Building2
  /* Item pertama aktif saat halaman dimuat; hover atau klik nomor
     memindahkan highlight ke item tersebut. */
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="timeline-column">
      <h2 className="timeline-title">{title}</h2>
      <ol className="timeline-list">
        {items.map((item, index) => (
          <TimelineItem
            key={item.name}
            item={item}
            index={index}
            active={index === activeIndex}
            onActivate={() => setActiveIndex(index)}
            FallbackIcon={FallbackIcon}
          />
        ))}
      </ol>
    </div>
  )
}

/* ============ Data folder ============ */
const FOLDER_PATH =
  'M24 34L232 34L256 8Q259 3 267 3L372 3Q400 3 400 31L400 216Q400 250 366 250L34 250Q0 250 0 216L0 68Q0 34 24 34Z'
const FOLDER_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250' preserveAspectRatio='none'%3E%3Cpath fill='%23fff' d='M24 34L232 34L256 8Q259 3 267 3L372 3Q400 3 400 31L400 216Q400 250 366 250L34 250Q0 250 0 216L0 68Q0 34 24 34Z'/%3E%3C/svg%3E\")"

/** Preview + detail modal — memakai konten asli, tanpa data karangan. */
function getPreviews(stat) {
  if (stat.label === 'Projects') {
    return projects.slice(0, 3).map((project) => ({
      key: project.title,
      title: project.title,
      sub: project.category,
      meta: project.tech.join(' · '),
      description: project.description,
      tech: project.tech,
      icon: project.icon,
      bg: project.gradient,
      tone: 'dark',
      category: 'Projects',
    }))
  }
  if (stat.label === 'Certificates') {
    return certificates.slice(0, 3).map((certificate) => ({
      key: certificate.name,
      title: certificate.name,
      sub: `${certificate.issuer} · ${certificate.year}`,
      meta: `${certificate.issuer} · ${certificate.year}`,
      icon: ShieldCheck,
      tone: 'light',
      category: 'Certificates',
    }))
  }
  return [
    {
      key: stat.label,
      title: stat.label,
      sub: stat.detail,
      meta: stat.detail,
      icon: stat.icon || Trophy,
      tone: 'dark',
      category: 'Awards',
    },
  ]
}

function goToPortfolio() {
  document.getElementById('Portofolio')?.scrollIntoView({ behavior: 'smooth' })
}

/* ============ Satu lembar kertas ============ */
function FolderPreview({ preview, index, onOpen }) {
  const Icon = preview.icon

  return (
    <button
      type="button"
      className={`folder-preview folder-preview--${index + 1} folder-preview--${preview.tone}`}
      style={preview.bg ? { backgroundImage: preview.bg } : undefined}
      onClick={() => onOpen(preview)}
      aria-label={`Buka ${preview.title}`}
    >
      {preview.tone === 'light' ? (
        <>
          <span className="folder-preview-issuer">{preview.sub}</span>
          <span className="folder-preview-title">{preview.title}</span>
        </>
      ) : (
        <>
          <span className="folder-preview-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {Icon && <Icon className="folder-preview-icon" size={14} aria-hidden="true" />}
          <span className="folder-preview-title">{preview.title}</span>
          <span className="folder-preview-sub">{preview.sub}</span>
        </>
      )}
    </button>
  )
}

/* ============ Kartu folder + dropdown + modal ============ */
function FolderCard({ stat }) {
  const previews = getPreviews(stat)
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState(null)
  const menuRef = useRef(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  /* Click-outside + Escape untuk dropdown */
  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) closeMenu()
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, closeMenu])

  /* Escape + kunci scroll saat modal terbuka */
  useEffect(() => {
    if (!active) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActive(null)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active])

  const handleToggleFolder = () => {
    setExpanded((value) => !value)
    closeMenu()
  }

  const handleExplore = () => {
    closeMenu()
    setExpanded(false)
    goToPortfolio()
  }

  return (
    <article className={`folder-card${expanded ? ' is-open' : ''}`}>
      <div className="folder-shell">
        <span className="folder-glass" aria-hidden="true" />

        <svg
          className="folder-outline"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d={FOLDER_PATH} vectorEffect="non-scaling-stroke" />
        </svg>

        <div className={`folder-previews${previews.length === 1 ? ' folder-previews--single' : ''}`}>
          {previews.map((preview, index) => (
            <FolderPreview key={preview.key} preview={preview} index={index} onOpen={setActive} />
          ))}
          <span className="folder-preview-fade" aria-hidden="true" />
        </div>

        <div className="folder-meta">
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>

        <div className="folder-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className={`folder-more${menuOpen ? ' is-active' : ''}`}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={`Menu ${stat.label}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Ellipsis size={18} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="folder-menu" role="menu" aria-label={`Menu ${stat.label}`}>
              <button
                type="button"
                className="folder-menu__item"
                role="menuitem"
                onClick={handleToggleFolder}
              >
                <span>{expanded ? 'Close folder' : 'Open folder'}</span>
              </button>
              <button
                type="button"
                className="folder-menu__item"
                role="menuitem"
                onClick={handleExplore}
              >
                <span>Explore All {stat.label}</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {active &&
        createPortal(
          <div className="folder-modal" onClick={() => setActive(null)}>
            <div
              className="folder-modal__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="folder-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="folder-modal__close"
                onClick={() => setActive(null)}
                aria-label="Tutup pratinjau"
              >
                <X size={18} aria-hidden="true" />
              </button>

              <div
                className={`folder-modal__visual folder-modal__visual--${active.tone}`}
                style={active.bg ? { backgroundImage: active.bg } : undefined}
              >
                {active.icon && (
                  <active.icon className="folder-modal__icon" size={44} aria-hidden="true" />
                )}
                <span className="folder-modal__tag">{active.category}</span>
              </div>

              <div className="folder-modal__body">
                <span className="folder-modal__eyebrow">{active.category}</span>
                <h3 id="folder-modal-title">{active.title}</h3>
                <p className="folder-modal__meta">{active.meta}</p>

                {active.description && (
                  <p className="folder-modal__description">{active.description}</p>
                )}

                {active.tech && (
                  <div className="folder-modal__chips">
                    {active.tech.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                )}

                <a
                  className="folder-modal__cta"
                  href="#Portofolio"
                  onClick={() => setActive(null)}
                >
                  <span>Lihat di Portofolio</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </article>
  )
}

/* ============ Section ============ */
export default function Experience() {
  /* Education ditampilkan urut kronologis (SMP → SMK) sesuai data. */
  const educationItems = education.map((item) => ({
    name: item.school,
    role: item.major || item.level,
    tag: item.tag,
    detail: item.detail,
    years: item.years,
    logo: item.logo,
    icon: item.icon,
  }))

  const experienceItems = experience.map((item) => ({
    name: item.company,
    role: item.role,
    tag: item.tag,
    detail: item.detail,
    years: item.years,
    logo: item.logo,
    icon: item.icon,
  }))

  const hasExperience = experienceItems.length > 0

  return (
    <section className="experience-section" aria-label="Education, experience, and statistics">
      <ContourBackdrop />

      <div className="experience-container">
        <div className={`experience-timeline${hasExperience ? '' : ' experience-timeline--single'}`}>
          <Timeline title="Education" items={educationItems} />
          {hasExperience && <Timeline title="Experience" items={experienceItems} />}
        </div>

        <div className="experience-stats">
          {stats.map((stat) => (
            <FolderCard key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
