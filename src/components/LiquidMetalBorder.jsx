import './LiquidMetalBorder.css'

/**
 * Border "liquid metal" — referensi memakai shader WebGL (kecepatan .6).
 * Di sini diaproksimasi dengan conic-gradient beranimasi di dalam cincin
 * 2px (mask exclude identik dengan referensi). Aproksimasi CSS, bukan
 * shader asli — lihat laporan keterbatasan.
 */
export default function LiquidMetalBorder({ className = '' }) {
  return (
    <div className={`liquid-metal-border ${className}`.trim()} aria-hidden="true">
      <span className="liquid-metal-sheen" />
    </div>
  )
}
