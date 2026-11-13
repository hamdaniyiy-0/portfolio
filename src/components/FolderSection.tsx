import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { MoreHorizontal, Trophy } from 'lucide-react'

/* ============================================================
   FolderSection.tsx
   Komponen mandiri (self-contained) untuk 3 folder portofolio.
   Stack: React + TypeScript + Tailwind CSS + Framer Motion.

   Prasyarat di proyek tujuan:
   - Tailwind CSS sudah dikonfigurasi (content mencakup file ini)
   - framer-motion & lucide-react terpasang
   ============================================================ */

type FolderId = 'projects' | 'certificates' | 'awards'

type Folder = {
  id: FolderId
  title: string
  count: number
}

type PreviewKind = 'project' | 'certificate' | 'award'

type Preview = {
  id: string
  kind: PreviewKind
  title: string
  sub: string
  gradient?: string
}

/* ============ Data dummy default ============ */
const FOLDERS: Folder[] = [
  { id: 'projects', title: 'Projects', count: 6 },
  { id: 'certificates', title: 'Certificates', count: 6 },
  { id: 'awards', title: 'Awards', count: 5 },
]

/* ============ Isi tumpukan kertas (3 kartu per folder) ============ */
const PREVIEWS: Record<FolderId, Preview[]> = {
  projects: [
    {
      id: 'project-1',
      kind: 'project',
      title: 'Nusa Commerce',
      sub: 'Web App',
      gradient: 'from-[#1e3a8a] via-[#1d4ed8] to-[#0ea5e9]',
    },
    {
      id: 'project-2',
      kind: 'project',
      title: 'Orbit Dashboard',
      sub: 'Dashboard',
      gradient: 'from-[#312e81] via-[#6d28d9] to-[#c026d3]',
    },
    {
      id: 'project-3',
      kind: 'project',
      title: 'Lanyard 3D',
      sub: '3D Web',
      gradient: 'from-[#0f766e] via-[#0d9488] to-[#38bdf8]',
    },
  ],
  certificates: [
    {
      id: 'cert-1',
      kind: 'certificate',
      title: 'Belajar Dasar Pemrograman Web',
      sub: 'Dicoding · 2024',
    },
    {
      id: 'cert-2',
      kind: 'certificate',
      title: 'Front-End Web with React',
      sub: 'FreeCodeCamp · 2025',
    },
    {
      id: 'cert-3',
      kind: 'certificate',
      title: 'JavaScript Algorithms',
      sub: 'FreeCodeCamp · 2025',
    },
  ],
  awards: [
    { id: 'award-1', kind: 'award', title: 'Award 01', sub: '2025' },
    { id: 'award-2', kind: 'award', title: 'Award 02', sub: '2024' },
    { id: 'award-3', kind: 'award', title: 'Award 03', sub: '2023' },
  ],
}

/* ============ Posisi tumpukan kertas ============ */
const PAPER_LAYOUT: CSSProperties[] = [
  { width: '70%', left: '15%', top: 6, height: 150 },
  { width: '76%', left: '12%', top: 18, height: 150 },
  { width: '82%', left: '9%', top: 30, height: 150 },
]

const REST_ROTATION = [-4, 0, 4]
const ACTIVE_ROTATION = [-8, 0, 8]
const ACTIVE_X = [-24, 0, 24]

/* ============ Animasi kertas ============ */
const paperVariants: Variants = {
  rest: (index: number) => ({
    x: 0,
    y: 0,
    rotate: REST_ROTATION[index]!,
    scale: 1,
    opacity: index === 2 ? 1 : 0.9,
    filter: 'brightness(0.94)',
  }),
  hover: (index: number) => ({
    x: 0,
    y: -10,
    rotate: REST_ROTATION[index]!,
    scale: 1.01,
    opacity: 1,
    filter: 'brightness(1)',
  }),
  active: (index: number) => ({
    x: ACTIVE_X[index]!,
    y: -40,
    rotate: ACTIVE_ROTATION[index]!,
    scale: 1.03,
    opacity: 1,
    filter: 'brightness(1.12)',
  }),
}

/* ============ Isi visual tiap kertas ============ */
function PreviewArt({ preview }: { preview: Preview }) {
  if (preview.kind === 'certificate') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-0.5 bg-[#f6f2e7] px-3 text-center text-[#2b2617]">
        <span className="text-[6px] font-bold uppercase tracking-[0.3em] text-[#9a8853]">
          Certificate
        </span>
        <span className="font-serif text-[11px] leading-tight font-semibold">{preview.title}</span>
        <span className="mt-0.5 h-px w-8 bg-[#c9b98a]" />
        <span className="text-[6px] tracking-wider text-[#8b7d52] uppercase">{preview.sub}</span>
      </div>
    )
  }

  if (preview.kind === 'award') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-[radial-gradient(circle_at_top,#3a2f18,#15120b_72%)] px-3 text-center">
        <Trophy className="h-5 w-5 text-amber-300/90" aria-hidden="true" />
        <span className="text-[9px] font-semibold text-amber-100/90">{preview.title}</span>
        <span className="text-[6px] tracking-[0.2em] text-amber-200/50 uppercase">
          {preview.sub}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col bg-gradient-to-br ${preview.gradient}`}>
      <div className="flex items-center gap-1 border-b border-white/20 bg-black/20 px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>
      <div className="flex flex-1 flex-col justify-center px-3">
        <span className="text-[10px] font-semibold text-white/95">{preview.title}</span>
        <span className="text-[7px] tracking-widest text-white/60 uppercase">{preview.sub}</span>
      </div>
    </div>
  )
}

type FolderCardProps = {
  folder: Folder
  isActive: boolean
  onSelect: (id: FolderId) => void
}

function FolderCard({ folder, isActive, onSelect }: FolderCardProps) {
  /* `hovered` hanya mengatur animasi visual — BUKAN state aktif. */
  const [hovered, setHovered] = useState(false)
  const reduceMotion = useReducedMotion() ?? false
  const previews = PREVIEWS[folder.id]

  const paperState = isActive ? 'active' : hovered ? 'hover' : 'rest'
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 28, mass: 0.8 }

  const activate = () => onSelect(folder.id)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${folder.title} folder, ${folder.count} item`}
      onClick={activate}
      onKeyDown={handleKeyDown}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative h-[280px] w-full cursor-pointer rounded-2xl outline-none select-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d12] sm:h-[300px]"
    >
      <motion.div
        className="relative h-full w-full"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={reduceMotion ? undefined : { y: -4 }}
        transition={transition}
      >
        {/* ===== LAPISAN 1 — back cover + tab folder ===== */}
        <div
          className={`absolute inset-x-0 bottom-0 top-6 z-0 rounded-2xl border border-white/10 bg-[#121318]/90 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-colors duration-300 group-hover:border-white/20 ${
            isActive ? 'bg-[#14161d]/95' : ''
          }`}
        />
        <div
          className={`absolute top-0 right-6 z-0 h-9 w-28 rounded-t-2xl border border-b-0 border-white/10 bg-[#121318] transition-colors duration-300 group-hover:border-white/20 ${
            isActive ? 'bg-[#14161d]' : ''
          }`}
        />

        {/* ===== LAPISAN 2 — tumpukan kertas / sertifikat ===== */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[190px]">
          {previews.map((preview, index) => (
            <motion.div
              key={preview.id}
              custom={index}
              variants={paperVariants}
              initial="rest"
              animate={paperState}
              transition={transition}
              style={{ ...(PAPER_LAYOUT[index] ?? {}), zIndex: 10 + index }}
              className="absolute overflow-hidden rounded-lg border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <PreviewArt preview={preview} />
            </motion.div>
          ))}
        </div>

        {/* ===== LAPISAN 3 — front cover (50% bawah) ===== */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 flex h-[54%] flex-col justify-end rounded-2xl border border-white/10 bg-gradient-to-t from-[#0b0c10] via-[#101218]/95 to-[#171a21]/70 p-5 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-[2px] transition-colors duration-300 group-hover:border-white/20 ${
            isActive ? 'border-white/20' : ''
          }`}
        >
          <div className="flex items-end justify-between gap-4">
            <div className="leading-none">
              <p className="text-3xl font-bold tracking-tight text-white">{folder.count}</p>
              <p className="mt-1.5 text-sm text-gray-400">{folder.title}</p>
            </div>

            <button
              type="button"
              aria-label={`More options for ${folder.title}`}
              onClick={(event) => {
                event.stopPropagation()
                activate()
              }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-gray-200 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <MoreHorizontal size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ============ Section ============ */
export default function FolderSection() {
  /* Default: folder pertama aktif. Perpindahan HANYA lewat klik. */
  const [activeTab, setActiveTab] = useState<FolderId>('projects')

  const handleSelect = (id: FolderId) => setActiveTab(id)

  return (
    <section className="min-h-screen bg-[#0b0d12] py-6 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
        {FOLDERS.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            isActive={activeTab === folder.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  )
}
