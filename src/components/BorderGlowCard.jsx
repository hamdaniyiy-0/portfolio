import { useRef } from 'react'
import './BorderGlowCard.css'

/**
 * Kartu dengan glow tepi yang mengikuti kursor — meniru `.border-glow-card`
 * referensi (mask conic + variabel --edge-proximity / --cursor-angle).
 * Nilai variabel dihitung dari jarak kursor ke tepi terdekat.
 */
export default function BorderGlowCard({ className = '', style, children, as: Tag = 'div' }) {
  const ref = useRef(null)

  const handleMove = (event) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const minDist = Math.min(x, y, rect.width - x, rect.height - y)
    // proximity 100 saat kursor menyentuh tepi, 0 saat jauh (>140px)
    const proximity = Math.max(0, Math.min(100, 100 - (minDist / 140) * 100))
    const angle = (Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180) / Math.PI
    el.style.setProperty('--edge-proximity', proximity.toFixed(1))
    el.style.setProperty('--cursor-angle', `${angle.toFixed(1)}deg`)
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--edge-proximity', '0')
  }

  return (
    <Tag
      ref={ref}
      className={`border-glow-card ${className}`.trim()}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </Tag>
  )
}
