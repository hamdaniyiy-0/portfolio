import { useEffect, useRef, useState } from 'react'
import { Building2, GraduationCap } from 'lucide-react'
import { awards, certificates, education, experience, projects } from '../data/portfolio'
import Folder from './react-bits/Folder'
import FolderModal from './FolderModal'
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
  const Icon = item.icon || FallbackIcon

  return (
    <span className="timeline-logo" aria-hidden="true">
      {showImage ? (
        <img
          className={`timeline-logo__img${item.logoBadge ? ' timeline-logo__img--badge' : ''}`}
          src={item.logo}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon size={16} />
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
      <div className="timeline-scroll">
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
    </div>
  )
}

/* ============ Folder interaktif (React Bits) ============ */
/* Warna aksen tiap folder. */
const FOLDER_COLORS = {
  Projects: '#2c67ed',
  Certificates: '#7aa7ff',
  Awards: '#00f0ff',
}

/* Ukuran `Folder` (basis 224px) mengikuti lebar kolom grid agar
   proporsional dari layar kecil sampai lebar. */
function useFolderSize(ref) {
  const [size, setSize] = useState(1)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const update = () => {
      const width = node.getBoundingClientRect().width
      if (!width) return
      setSize(Math.max(0.82, Math.min(1.5, (width - 8) / 224)))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  return size
}
/* ============ Section ============ */
export default function Experience() {
  /* Folder yang sedang dibuka di FolderModal: 'Projects' | 'Certificates' | 'Awards'. */
  const [activeFolder, setActiveFolder] = useState(null)

  /* Education ditampilkan urut kronologis (SMP ke SMK) sesuai data. */
  const educationItems = education.map((item) => ({
    name: item.school,
    role: item.major || item.level,
    tag: item.tag,
    detail: item.detail,
    years: item.years,
    logo: item.logo,
    logoBadge: item.logoBadge,
    icon: item.icon,
  }))

  const experienceItems = experience.map((item) => ({
    name: item.title,
    role: item.company,
    tag: item.type,
    detail: item.detail,
    years: item.years,
    logo: item.logo,
    logoBadge: item.logoBadge,
    icon: item.icon,
  }))

  const hasExperience = experienceItems.length > 0

  /* Ukuran folder mengikuti lebar kartu pertama di grid. */
  const firstFolderRef = useRef(null)
  const folderSize = useFolderSize(firstFolderRef)

  /* Data asli hanya dipetakan ke properti yang dibutuhkan Folder
     (`title` + `image`); tidak ada isi yang diubah atau dihapus. */
  const folders = [
    {
      label: 'Projects',
      items: projects.map((project) => ({
        title: project.title,
        image: project.image,
      })),
    },
    {
      label: 'Certificates',
      items: certificates.map((certificate) => ({
        title: certificate.title,
        image: certificate.image,
      })),
    },
    {
      label: 'Awards',
      items: awards.map((award) => ({
        title: award.title,
        image: award.image,
      })),
    },
  ]

  /* Isi File Manager memakai seluruh item (termasuk meta tambahan). */
  const folderItems = {
    Projects: projects.map((project) => ({
      title: project.title,
      image: project.image,
      meta: project.category,
    })),
    Certificates: certificates.map((certificate) => ({
      title: certificate.title,
      image: certificate.image,
      meta: certificate.issuer,
    })),
    Awards: awards.map((award) => ({
      title: award.title,
      image: award.image,
      meta: award.issuer,
    })),
  }
  const activeItems = activeFolder ? folderItems[activeFolder] ?? [] : []

  return (
    <section className="experience-section" aria-label="Education, experience, and statistics">
      <ContourBackdrop />

      <div className="experience-container">
        <div className={`experience-timeline${hasExperience ? '' : ' experience-timeline--single'}`}>
          <Timeline title="Education" items={educationItems} />
          {hasExperience && <Timeline title="Experience" items={experienceItems} />}
        </div>

        <div className="experience-stats">
          {folders.map((folder, index) => (
            <div
              className="card-folder-wrapper"
              key={folder.label}
              ref={index === 0 ? firstFolderRef : undefined}
            >
              <Folder
                label={folder.label}
                items={folder.items}
                variant="glass"
                theme="dark"
                layout="stack"
                color={FOLDER_COLORS[folder.label]}
                size={folderSize}
                onItemClick={(item) => {
                  console.log(`${folder.label} clicked:`, item)
                  setActiveFolder(folder.label)
                }}
              />
            </div>
          ))}
        </div>

        <FolderModal
          isOpen={Boolean(activeFolder)}
          onClose={() => setActiveFolder(null)}
          data={activeItems}
          title={activeFolder ? `All ${activeFolder} (${activeItems.length})` : ''}
        />
      </div>
    </section>
  )
}
