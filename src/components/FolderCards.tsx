'use client'

import { useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Trophy } from 'lucide-react'

/* ============================================================
   FolderCards.tsx  (revisi)
   Tiga folder kaca untuk bagian "About > Education".

   Bentuk folder memakai CSS clip-path (clipPathUnits=
   objectBoundingBox) sehingga tab melengkung di kiri atas dan
   sudut membulat tetap proporsional di semua ukuran.

   Lapisan (z-index):
     z-0  back  : siluet folder solid gelap (#121318)
     z-10 papers: 2–3 kertas, menjulang keluar dari mulut folder
     z-20 front : panel kaca  (backdrop-blur-md / bg-white/5 /
                  border-white/10) + angka, label, tombol kapsul

   Stack: React (Next.js) + TypeScript + Tailwind CSS + Framer Motion.
   ============================================================ */

type PaperKind = 'project' | 'certificate' | 'award'

type Paper = {
  id: string
  kind: PaperKind
  /** rotasi kertas (derajat) */
  rotate: number
  /** pergeseran vertikal di dalam tumpukan (px) */
  offsetY: number
}

type FolderItem = {
  id: string
  title: string
  count: number
  /** warna glow di bawah folder */
  glow: string
  papers: Paper[]
}

/* ============ Data array (mudah di-looping) ============ */
const FOLDERS: FolderItem[] = [
  {
    id: 'projects',
    title: 'Projects',
    count: 6,
    glow: 'bg-violet-600/30',
    papers: [
      { id: 'project-1', kind: 'project', rotate: -3, offsetY: 0 },
      { id: 'project-2', kind: 'project', rotate: 2, offsetY: 16 },
      { id: 'project-3', kind: 'project', rotate: -2, offsetY: 30 },
    ],
  },
  {
    id: 'certificates',
    title: 'Certificates',
    count: 6,
    glow: 'bg-sky-500/30',
    papers: [
      { id: 'cert-1', kind: 'certificate', rotate: -3, offsetY: 0 },
      { id: 'cert-2', kind: 'certificate', rotate: 2, offsetY: 16 },
      { id: 'cert-3', kind: 'certificate', rotate: -2, offsetY: 30 },
    ],
  },
  {
    id: 'awards',
    title: 'Awards',
    count: 5,
    glow: 'bg-amber-500/30',
    papers: [
      { id: 'award-1', kind: 'award', rotate: -3, offsetY: 0 },
      { id: 'award-2', kind: 'award', rotate: 2, offsetY: 16 },
      { id: 'award-3', kind: 'award', rotate: -2, offsetY: 30 },
    ],
  },
]

/* ============ Animasi (hover murni visual) ============ */
const cardVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -10 },
}

const paperVariants: Variants = {
  rest: (paper: Paper) => ({ y: 0, rotate: paper.rotate }),
  hover: (paper: Paper) => ({ y: -20, rotate: paper.rotate }),
}

const glowVariants: Variants = {
  rest: { opacity: 0.4, scale: 0.96 },
  hover: { opacity: 0.8, scale: 1.08 },
}

/* ============ Siluet folder (clip-path, unit 0..1) ============ */
/* Tab melengkung di KIRI ATAS, mulut folder cekung, sudut membulat. */
const FOLDER_CLIP_PATH =
  'M0.055,0.025 L0.36,0.025 C0.395,0.025 0.415,0.05 0.435,0.105 C0.452,0.152 0.478,0.178 0.53,0.18 L0.945,0.18 C0.975,0.18 1,0.205 1,0.235 L1,0.945 C1,0.975 0.975,1 0.945,1 L0.055,1 C0.025,1 0,0.975 0,0.945 L0,0.085 C0,0.05 0.025,0.025 0.055,0.025 Z'

function FolderDefs() {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="folder-silhouette" clipPathUnits="objectBoundingBox">
          <path d={FOLDER_CLIP_PATH} />
        </clipPath>
      </defs>
    </svg>
  )
}

/* ============ Isi tiap kertas ============ */
function PaperArt({ kind }: { kind: PaperKind }) {
  if (kind === 'certificate') {
    return (
      <div className="flex h-full flex-col items-center justify-start gap-0.5 bg-[#f4f4f2] px-3 pt-3 text-center">
        <span className="text-[6px] font-bold tracking-[0.3em] text-neutral-400 uppercase">
          Certificate
        </span>
        <span className="font-serif text-[11px] font-semibold text-neutral-800">
          of Achievement
        </span>
        <span className="mt-0.5 h-px w-8 bg-neutral-400/60" />
        <span className="text-[6px] tracking-wider text-neutral-400 uppercase">2025</span>
      </div>
    )
  }

  if (kind === 'award') {
    return (
      <div className="flex h-full flex-col items-center justify-start gap-1 bg-gradient-to-br from-[#4a4238] to-[#2a2621] px-3 pt-3 text-center">
        <Trophy className="h-4 w-4 text-amber-300/80" aria-hidden="true" />
        <span className="text-[9px] font-semibold text-amber-100/90">Award of Excellence</span>
        <span className="text-[6px] tracking-[0.2em] text-amber-200/50 uppercase">2024</span>
      </div>
    )
  }

  /* project */
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      <div className="flex items-center gap-1 border-b border-white/25 bg-black/20 px-2 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden="true" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/45" aria-hidden="true" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" aria-hidden="true" />
      </div>
      <div className="flex flex-col px-3 pt-2">
        <span className="text-[10px] font-semibold text-white/95">Projects UI</span>
        <span className="text-[7px] tracking-widest text-white/60 uppercase">Web App</span>
      </div>
    </div>
  )
}

/* ============ Satu folder ============ */
function FolderCard({ folder }: { folder: FolderItem }) {
  const reduceMotion = useReducedMotion() ?? false
  const [hovered, setHovered] = useState(false)
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 24, mass: 0.7 }

  const clip = { clipPath: 'url(#folder-silhouette)' }

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover={reduceMotion ? undefined : 'hover'}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative isolate w-full max-w-[340px] select-none"
      aria-label={`${folder.title}: ${folder.count} item`}
    >
      {/* Glow bawah folder */}
      <motion.div
        variants={glowVariants}
        transition={transition}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-10 -bottom-1 -z-10 h-14 rounded-full blur-2xl ${folder.glow}`}
      />

      <motion.div
        variants={cardVariants}
        transition={transition}
        className="relative h-[290px] w-full"
      >
        {/* ===== z-0: siluet folder (rim + solid gelap) ===== */}
        <div className="absolute inset-0 z-0 bg-white/10" style={clip} aria-hidden="true" />
        <div
          className="absolute inset-px z-0 bg-[#121318]"
          style={clip}
          aria-hidden="true"
        />

        {/* ===== z-10: tumpukan kertas (sebagian tertutup front) ===== */}
        <div className="absolute inset-0 z-10">
          {folder.papers.map((paper, index) => (
            <motion.div
              key={paper.id}
              custom={paper}
              variants={paperVariants}
              transition={transition}
              style={{ top: 54 + paper.offsetY, zIndex: 10 + index }}
              className="absolute right-[9%] left-[9%] h-[150px] overflow-hidden rounded-xl border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.55)]"
            >
              <PaperArt kind={paper.kind} />
              {/* overlay gelap agar isi kertas tidak menyilaukan */}
              <span className="pointer-events-none absolute inset-0 bg-black/30" aria-hidden="true" />
            </motion.div>
          ))}
        </div>

        {/* ===== z-20: bagian depan (kaca) ===== */}
        <div
          className={`absolute inset-x-[3%] bottom-[3%] z-20 h-[56%] overflow-hidden rounded-2xl border backdrop-blur-md transition-colors duration-300 ${
            hovered ? 'border-white/20 bg-[#1a1a1a]/85' : 'border-white/10 bg-[#1a1a1a]/80'
          }`}
        >
          {/* kilau tipis di tepi atas kaca (tidak mengganggu kontras) */}
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.07] via-transparent to-black/25"
            aria-hidden="true"
          />

          {/* Angka + label: pojok kiri bawah, z-50 agar tidak tertutup kertas */}
          <div className="absolute bottom-4 left-4 z-50">
            <p className="text-2xl leading-none font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              {folder.count}
            </p>
            <p className="mt-0.5 text-xs font-medium text-gray-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
              {folder.title}
            </p>
          </div>

          {/* Tombol kapsul tiga lingkaran: pojok kanan bawah, z-50 */}
          <button
            type="button"
            aria-label={`More options for ${folder.title}`}
            className="absolute right-4 bottom-4 z-50 flex h-10 w-14 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 text-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-colors duration-200 hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:outline-none"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </motion.article>
  )
}

/* ============ Section ============ */
export default function FolderCards() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 py-20 text-white"
      aria-label="Portfolio folders"
    >
      <FolderDefs />

      {/* Flexbox: tiga folder sejajar di tengah, turun jadi kolom di layar kecil */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-10 md:flex-row md:gap-8">
        {FOLDERS.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>
    </section>
  )
}
