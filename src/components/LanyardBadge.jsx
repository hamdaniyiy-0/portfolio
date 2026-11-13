import { Component, useEffect, useMemo, useRef, useState } from 'react'
import Lanyard from './react-bits/Lanyard'
import { supportsWebGL } from '../lib/webgl'
import { lanyard, profile } from '../data/portfolio'

/**
 * Wrapper untuk komponen resmi React Bits Lanyard.
 * - Memakai GAMBAR HASIL EDIT milik pengguna (public/card-front.png,
 *   public/card-back.png, public/band.png) — dilewatkan lewat config data.
 *   Tidak ada gambar default/placeholder, dan tidak ada gambar pengganti
 *   bila file tidak ditemukan (laporkan saja kepada pemilik situs).
 * - Menyediakan fallback statis bila WebGL tidak tersedia / gagal.
 * - Physics, drag, throw, dan klik-untuk-membalik berasal dari komponen resmi.
 */

/** Jaring pengaman bila renderer 3D melempar error runtime. */
class LanyardBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('[Lanyard] beralih ke kartu statis:', error?.message)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function LanyardBadge() {
  const webgl = useMemo(() => supportsWebGL(), [])
  const [failed, setFailed] = useState(false)
  // Kanvas menutupi seluruh hero di layar lebar → sesuaikan posisi & ukuran kartu
  const [wide, setWide] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const staticMode = !webgl || failed
  const fallback = <StaticBadge />

  /* Saat kanvas melebar ke seluruh hero (desktop), jangkar kartu dipindah ke
     sisi kanan dan ukurannya disesuaikan agar proporsional dengan area besar.
     frontImage / backImage / strapImage berasal dari lanyard.config (gambar
     hasil edit pengguna). */
  const config = {
    ...lanyard.config,
    anchor: wide ? 'right' : lanyard.config.anchor,
    // Ukuran lebih besar di layar lebar agar kartu seimbang dengan judul
    // hero (mengikuti komposisi gambar referensi: kartu ~315x465 pada 1440px).
    size: wide ? 0.62 : lanyard.config.size,
  }

  return (
    <div className={`lanyard-stage${staticMode ? ' lanyard-stage--boxed' : ''}`}>
      {staticMode ? (
        fallback
      ) : (
        <LanyardBoundary key="lanyard" fallback={fallback}>
          <Lanyard {...config} />
        </LanyardBoundary>
      )}
    </div>
  )
}

/** Kartu statis 3D-palsu (CSS perspective) untuk perangkat tanpa WebGL.
 *  Memakai gambar hasil edit yang sama (card-front.png). */
function StaticBadge() {
  const cardRef = useRef(null)

  const handleMove = (event) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `rotateX(${(-py * 14).toFixed(2)}deg) rotateY(${(px * 18).toFixed(2)}deg)`
  }

  const handleLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }

  return (
    <div className="lanyard-fallback" onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <span className="fb-string" aria-hidden="true" />
      <span className="fb-clip" aria-hidden="true" />
      <div className="fb-float">
        <div ref={cardRef} className="fb-card">
          <img
            src={lanyard.config.frontImage}
            alt={`Kartu identitas ${profile.name} (pratinjau statis)`}
            draggable={false}
            onError={(event) => {
              // Gambar tidak bisa dimuat → sembunyikan (tanpa gambar pengganti)
              event.currentTarget.style.display = 'none'
            }}
          />
        </div>
      </div>
      <p className="fb-note font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        WebGL tidak tersedia — kartu ditampilkan statis
      </p>
    </div>
  )
}
